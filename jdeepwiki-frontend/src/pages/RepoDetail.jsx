import React, { useState, useEffect } from 'react';
import { 
  Layout,
  Tree,
  Typography, 
  Button, 
  Space, 
  Breadcrumb,
  Tag,
  Spin,
  Alert,
  Card,
  Divider
} from 'antd';
import { 
  GithubOutlined, 
  StarOutlined, 
  HomeOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  FolderOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TaskApi } from '../api/task';
import { formatDateTime } from '../utils/dateFormat';
import PageLoading from '../components/PageLoading';

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;

const RepoDetail = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [catalogueTree, setCatalogueTree] = useState([]);
  const [selectedContent, setSelectedContent] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);

  // 获取任务详情和目录树
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 并行获取任务详情和目录树
        const [taskResponse, treeResponse] = await Promise.all([
          TaskApi.getTaskDetail(taskId),
          TaskApi.getCatalogueTree(taskId)
        ]);
        
        if (taskResponse.code === 200) {
          setTask(taskResponse.data);
        } else {
          setError(taskResponse.msg || '获取仓库详情失败');
          return;
        }
        
        if (treeResponse.code === 200) {
          const treeData = buildTreeData(treeResponse.data);
          setCatalogueTree(treeData);
          
          // 默认选择第一个有内容的叶子节点
          const firstLeaf = findFirstLeafWithContent(treeResponse.data);
          if (firstLeaf) {
            setSelectedContent(firstLeaf.content || '');
            setSelectedTitle(firstLeaf.title || '');
          }
        }
        
        setError('');
      } catch (error) {
        console.error('获取数据失败:', error);
        setError('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchData();
    } else {
      setError('无效的仓库ID');
      setLoading(false);
    }
  }, [taskId]);

  // 构建树形数据结构
  const buildTreeData = (data) => {
    const buildNode = (item) => ({
      title: item.title,
      key: item.catalogueId,
      icon: item.children && item.children.length > 0 ? <FolderOutlined /> : <FileTextOutlined />,
      content: item.content,
      name: item.name,
      isLeaf: !item.children || item.children.length === 0,
      children: item.children ? item.children.map(buildNode) : []
    });

    return data.map(buildNode);
  };

  // 查找第一个有内容的叶子节点
  const findFirstLeafWithContent = (data) => {
    for (const item of data) {
      if (item.children && item.children.length > 0) {
        const found = findFirstLeafWithContent(item.children);
        if (found) return found;
      } else if (item.content) {
        return item;
      }
    }
    return null;
  };

  // 查找节点内容
  const findNodeContent = (treeData, key) => {
    for (const node of treeData) {
      if (node.key === key) {
        return { content: node.content, title: node.title };
      }
      if (node.children && node.children.length > 0) {
        const found = findNodeContent(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // 处理节点选择
  const handleTreeSelect = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      const nodeData = findNodeContent(catalogueTree, selectedKeys[0]);
      if (nodeData) {
        setSelectedContent(nodeData.content || '暂无内容');
        setSelectedTitle(nodeData.title || '');
      }
    }
  };

  // 随机生成星星数
  const getRandomStars = () => {
    return Math.floor(Math.random() * 200) + 1;
  };

  // 渲染加载状态
  if (loading) {
    return <PageLoading tip="加载仓库详情..." />;
  }

  // 渲染错误状态
  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        />
      </div>
    );
  }

  // 提取仓库名称
  const repoName = task?.projectUrl?.includes('github.com') 
    ? task.projectUrl.split('github.com/')[1]?.split('/').slice(0, 2).join(' / ')
    : task?.projectName;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 页面头部 */}
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid #f0f0f0',
        background: '#fff'
      }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item href="/" onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}>
            <HomeOutlined /> 首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>{repoName}</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space direction="vertical" size="small">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <GithubOutlined style={{ fontSize: 20, marginRight: 8 }} />
              <Title level={4} style={{ margin: 0 }}>{repoName}</Title>
            </div>
            <Space size="large">
              <Tag icon={<StarOutlined />} color="default">
                {getRandomStars()}k stars
              </Tag>
              <Text type="secondary">
                更新于 {formatDateTime(task?.updateTime, 'YYYY-MM-DD')}
              </Text>
            </Space>
          </Space>
          
          <Space>
            <Button 
              type="primary" 
              icon={<ShareAltOutlined />}
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
            >
              分享
            </Button>
            <Button
              href={task?.projectUrl}
              target="_blank"
              icon={<GithubOutlined />}
            >
              查看源码
            </Button>
          </Space>
        </div>
      </div>

      {/* 主体布局 */}
      <Layout style={{ flex: 1 }}>
        {/* 左侧目录树 */}
        <Sider 
          width={300} 
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{ 
            background: '#fff',
            borderRight: '1px solid #f0f0f0'
          }}
          trigger={
            <div style={{ textAlign: 'center', padding: '8px' }}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
          }
        >
          <div style={{ padding: '16px 8px' }}>
            {!collapsed && (
              <Title level={5} style={{ marginBottom: 16, paddingLeft: 8 }}>
                导出文档
              </Title>
            )}
            
            {catalogueTree.length > 0 ? (
              <Tree
                showIcon
                defaultExpandAll
                onSelect={handleTreeSelect}
                treeData={catalogueTree}
                style={{ fontSize: '14px' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin spinning={treeLoading}>
                  <Text type="secondary">暂无目录数据</Text>
                </Spin>
              </div>
            )}
          </div>
        </Sider>

        {/* 右侧内容区域 */}
        <Content style={{ 
          padding: '24px',
          background: '#fff',
          overflow: 'auto'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  {selectedTitle || '选择左侧目录查看内容'}
                </div>
              }
              style={{ height: '100%' }}
              bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
            >
              {selectedContent ? (
                <div 
                  style={{ 
                    lineHeight: 1.8,
                    fontSize: '14px'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: selectedContent.replace(/\n/g, '<br/>') 
                  }}
                />
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: 'rgba(0, 0, 0, 0.45)'
                }}>
                  <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <Paragraph>
                    请从左侧目录中选择一个文档来查看详细内容
                  </Paragraph>
                </div>
              )}
            </Card>
          </motion.div>
        </Content>
      </Layout>
    </div>
  );
};

export default RepoDetail; 