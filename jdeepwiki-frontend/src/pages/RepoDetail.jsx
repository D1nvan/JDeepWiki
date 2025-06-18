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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // 代码高亮样式
import { TaskApi } from '../api/task';
import { formatDateTime } from '../utils/dateFormat';
import PageLoading from '../components/PageLoading';
import MermaidChart from '../components/MermaidChart';

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;

// Markdown 自定义样式
const markdownStyles = {
  container: {
    lineHeight: 1.8,
    fontSize: '14px',
    color: '#262626'
  },
  heading: {
    marginTop: '24px',
    marginBottom: '16px',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '8px'
  },
  blockquote: {
    borderLeft: '4px solid #1890ff',
    paddingLeft: '16px',
    margin: '16px 0',
    background: '#f6f8fa',
    padding: '16px',
    borderRadius: '6px'
  },
  inlineCode: {
    background: '#f6f8fa',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '13px',
    color: '#d73a49',
    fontFamily: '"SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "monospace"',
    border: '1px solid #e1e4e8',
    verticalAlign: 'baseline'
  },
  codeBlock: {
    background: '#f6f8fa',
    padding: '16px',
    borderRadius: '6px',
    overflow: 'auto',
    fontSize: '13px',
    fontFamily: '"SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "monospace"',
    border: '1px solid #e1e4e8'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #d9d9d9',
    marginTop: '16px',
    marginBottom: '16px'
  },
  th: {
    border: '1px solid #d9d9d9',
    padding: '12px 16px',
    background: '#fafafa',
    fontWeight: 'bold',
    textAlign: 'left'
  },
  td: {
    border: '1px solid #d9d9d9',
    padding: '12px 16px'
  },
  list: {
    paddingLeft: '20px',
    margin: '16px 0'
  },
  listItem: {
    marginBottom: '6px'
  }
};

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
      title: item.name, // 一级和二级目录都显示name
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
                  style={markdownStyles.container}
                  className="markdown-content"
                >
                  <style>
                    {`
                      .markdown-content code:not(pre code) {
                        display: inline !important;
                        padding: 0 3px !important;
                        margin: 0 !important;
                        background: #f8f8f8 !important;
                        color: #e83e8c !important;
                        border-radius: 3px !important;
                        font-size: 0.9em !important;
                        line-height: inherit !important;
                        white-space: nowrap !important;
                        vertical-align: baseline !important;
                        border: none !important;
                        box-sizing: border-box !important;
                      }
                    `}
                  </style>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      // 测试函数，打印所有代码块
                      code: ({node, inline, className = '', children, ...props}) => {
                        console.log('Code block detected:', { inline, className, children });
                        
                        // 只处理内联代码，让pre组件处理代码块
                        if (inline) {
                          return (
                            <code 
                              style={{
                                background: '#f8f8f8',
                                padding: '0 3px',
                                margin: '0',
                                borderRadius: '3px',
                                fontSize: '0.9em',
                                color: '#e83e8c',
                                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                display: 'inline',
                                lineHeight: 'inherit',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'baseline',
                                border: 'none',
                                boxSizing: 'border-box'
                              }}
                              className={className}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        
                        // 非内联代码由pre组件处理
                        return (
                          <code 
                            style={{
                              background: 'transparent',
                              padding: '0',
                              margin: '0',
                              borderRadius: '0',
                              fontSize: 'inherit',
                              color: 'inherit',
                              fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                              display: 'block',
                              lineHeight: '1.45',
                              whiteSpace: 'pre',
                              verticalAlign: 'baseline',
                              border: 'none',
                              boxSizing: 'border-box'
                            }}
                            className={className}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      // 自定义渲染组件
                      h1: ({children}) => (
                        <Typography.Title 
                          level={2} 
                          style={markdownStyles.heading}
                        >
                          {children}
                        </Typography.Title>
                      ),
                      h2: ({children}) => (
                        <Typography.Title 
                          level={3} 
                          style={markdownStyles.heading}
                        >
                          {children}
                        </Typography.Title>
                      ),
                      h3: ({children}) => (
                        <Typography.Title 
                          level={4} 
                          style={markdownStyles.heading}
                        >
                          {children}
                        </Typography.Title>
                      ),
                      h4: ({children}) => (
                        <Typography.Title 
                          level={5}
                          style={markdownStyles.heading}
                        >
                          {children}
                        </Typography.Title>
                      ),
                      p: ({children}) => (
                        <Typography.Paragraph 
                          style={{ 
                            marginBottom: '16px',
                            lineHeight: '1.8',
                            wordBreak: 'break-word'
                          }}
                        >
                          {children}
                        </Typography.Paragraph>
                      ),
                      blockquote: ({children}) => (
                        <div style={markdownStyles.blockquote}>
                          {children}
                        </div>
                                              ),
                      pre: ({children}) => {
                        // 安全地检查子元素是否是 Mermaid 图表
                        try {
                          // 验证 children 是否存在
                          if (!children) {
                            return <pre style={markdownStyles.codeBlock}>{children}</pre>;
                          }

                          // 尝试提取文本内容来检测是否是Mermaid
                          let textContent = '';
                          let isMermaid = false;
                          
                          // 递归提取所有文本内容
                          const extractText = (node) => {
                            if (typeof node === 'string') {
                              return node;
                            } else if (node && node.props && node.props.children) {
                              if (typeof node.props.children === 'string') {
                                return node.props.children;
                              } else if (Array.isArray(node.props.children)) {
                                return node.props.children.map(extractText).join('');
                              }
                            }
                            return '';
                          };
                          
                          if (Array.isArray(children)) {
                            textContent = children.map(extractText).join('');
                          } else {
                            textContent = extractText(children);
                          }
                          
                          // 检查是否包含Mermaid语法
                          const mermaidPatterns = [
                            /^graph\s/i,
                            /^flowchart\s/i,
                            /^sequenceDiagram/i,
                            /^classDiagram/i,
                            /^stateDiagram/i,
                            /^erDiagram/i,
                            /^gantt/i,
                            /^journey/i,
                            /^pie\s/i,
                            /^gitgraph/i
                          ];
                          
                          textContent = textContent.trim();
                          isMermaid = mermaidPatterns.some(pattern => pattern.test(textContent));
                          
                          if (isMermaid && textContent) {
                            // 生成唯一ID
                            const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                            
                            return (
                              <MermaidChart 
                                chart={textContent} 
                                id={uniqueId}
                                key={uniqueId}
                              />
                            );
                          }
                        } catch (e) {
                          // 如果处理过程中出现任何错误，回退到普通的 pre 渲染
                          console.warn('Pre component Mermaid processing error:', e);
                        }
                        
                        // 默认情况：渲染普通的代码块
                        return (
                          <pre style={markdownStyles.codeBlock}>
                            {children}
                          </pre>
                        );
                      },
                      table: ({children}) => (
                        <div style={{ overflow: 'auto', margin: '16px 0' }}>
                          <table style={markdownStyles.table}>
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({children}) => (
                        <th style={markdownStyles.th}>
                          {children}
                        </th>
                      ),
                      td: ({children}) => (
                        <td style={markdownStyles.td}>
                          {children}
                        </td>
                      ),
                      ul: ({children}) => (
                        <ul style={markdownStyles.list}>
                          {children}
                        </ul>
                      ),
                      ol: ({children}) => (
                        <ol style={markdownStyles.list}>
                          {children}
                        </ol>
                      ),
                      li: ({children}) => (
                        <li style={markdownStyles.listItem}>
                          {children}
                        </li>
                      ),
                      a: ({children, href}) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#1890ff', textDecoration: 'none' }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                          {children}
                        </a>
                      ),
                      strong: ({children}) => (
                        <strong style={{ fontWeight: 600, color: '#262626' }}>
                          {children}
                        </strong>
                      ),
                      em: ({children}) => (
                        <em style={{ fontStyle: 'italic', color: '#595959' }}>
                          {children}
                        </em>
                      ),
                      hr: () => (
                        <hr style={{ 
                          margin: '24px 0', 
                          border: 'none', 
                          borderTop: '1px solid #f0f0f0' 
                        }} />
                      )
                    }}
                  >
                    {selectedContent}
                  </ReactMarkdown>
                </div>
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