import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Tabs, 
  Divider, 
  Breadcrumb,
  Tag,
  Spin,
  Alert,
  Input
} from 'antd';
import { 
  GithubOutlined, 
  StarOutlined, 
  HomeOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TaskApi } from '../api/task';
import { formatDateTime } from '../utils/dateFormat';
import PageLoading from '../components/PageLoading';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const RepoDetail = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('1');

  // 获取任务详情
  useEffect(() => {
    const fetchTaskDetail = async () => {
      setLoading(true);
      try {
        const response = await TaskApi.getTaskDetail(taskId);
        if (response.code === 200) {
          setTask(response.data);
          setError('');
        } else {
          setError(response.msg || '获取仓库详情失败');
        }
      } catch (error) {
        console.error('获取仓库详情失败:', error);
        setError('获取仓库详情失败');
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTaskDetail();
    } else {
      setError('无效的仓库ID');
      setLoading(false);
    }
  }, [taskId]);

  // 随机生成星星数
  const getRandomStars = () => {
    return Math.floor(Math.random() * 200) + 1;
  };

  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  // 渲染加载状态
  if (loading) {
    return <PageLoading tip="加载仓库详情..." />;
  }

  // 渲染错误状态
  if (error) {
    return (
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
    );
  }

  // 提取仓库名称
  const repoName = task?.projectUrl.includes('github.com') 
    ? task.projectUrl.split('github.com/')[1]?.split('/').slice(0, 2).join(' / ')
    : task?.projectName;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item href="/" onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}>
            <HomeOutlined /> 首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>{repoName}</Breadcrumb.Item>
        </Breadcrumb>

        <motion.div variants={itemVariants}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Space direction="vertical" size="small">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <GithubOutlined style={{ fontSize: 24, marginRight: 12 }} />
                    <Title level={3} style={{ margin: 0 }}>{repoName}</Title>
                  </div>
                  <Paragraph 
                    style={{ 
                      color: 'rgba(0, 0, 0, 0.65)', 
                      marginTop: 8,
                      maxWidth: 700
                    }}
                  >
                    {task?.projectName} - 在 {formatDateTime(task?.createTime, 'YYYY-MM-DD')} 创建
                  </Paragraph>
                </Space>
                
                <Space>
                  <Button 
                    type="primary" 
                    icon={<ShareAltOutlined />}
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
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

              <div>
                <Space size="large">
                  <Tag icon={<StarOutlined />} color="default">
                    {getRandomStars()}k stars
                  </Tag>
                  <Text type="secondary">
                    更新于 {formatDateTime(task?.updateTime, 'YYYY-MM-DD')}
                  </Text>
                </Space>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                style={{ marginTop: 8 }}
              >
                <TabPane 
                  tab={<span><FileTextOutlined /> 仓库概览</span>} 
                  key="1"
                >
                  <div style={{ minHeight: 300, padding: '16px 0' }}>
                    <Paragraph>
                      这是一个对 <strong>{repoName}</strong> 的深度分析页面。以下是关于这个仓库的基本信息：
                    </Paragraph>
                    <ul>
                      <li>项目名称: {task?.projectName}</li>
                      <li>项目地址: <a href={task?.projectUrl} target="_blank" rel="noreferrer">{task?.projectUrl}</a></li>
                      <li>创建时间: {formatDateTime(task?.createTime)}</li>
                      <li>更新时间: {formatDateTime(task?.updateTime)}</li>
                    </ul>
                    <Paragraph>
                      您可以在此页面浏览代码结构、提问问题以及深入理解这个仓库。
                    </Paragraph>
                  </div>
                </TabPane>
                <TabPane 
                  tab={<span><CodeOutlined /> 代码结构</span>} 
                  key="2"
                >
                  <div style={{ minHeight: 300, padding: '16px 0' }}>
                    <Alert
                      message="正在处理代码结构"
                      description="我们正在分析仓库的代码结构，这个过程可能需要一些时间。请稍后再查看。"
                      type="info"
                      showIcon
                    />
                  </div>
                </TabPane>
                <TabPane 
                  tab={<span><QuestionCircleOutlined /> 提问</span>} 
                  key="3"
                >
                  <div style={{ minHeight: 300, padding: '16px 0' }}>
                    <Paragraph>
                      对这个仓库有任何问题？输入您的问题，AI将帮助您理解代码。
                    </Paragraph>
                    <TextArea
                      rows={4}
                      placeholder="例如：这个项目的主要功能是什么？如何使用这个库？"
                      style={{ marginBottom: 16 }}
                    />
                    <Button type="primary">提交问题</Button>
                  </div>
                </TabPane>
              </Tabs>
            </Space>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RepoDetail; 