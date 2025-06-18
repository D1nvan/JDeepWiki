import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

// 确保 Mermaid 只初始化一次
let isInitialized = false;

// 错误边界组件
class MermaidErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Mermaid Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          margin: '20px 0',
          padding: '16px',
          border: '1px solid #ffccc7',
          borderRadius: '6px',
          background: '#fff1f0',
          color: '#cf1322',
          textAlign: 'center',
          fontSize: '13px',
        }}>
          <strong>📊 图表组件错误</strong>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            {this.state.error?.message || '未知错误'}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const MermaidChart = React.memo(({ chart, id }) => {
  const containerRef = useRef(null);
  const [renderState, setRenderState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const isMountedRef = useRef(true);
  const renderTimeoutRef = useRef(null);

  // 清理和标准化图表内容
  const chartContent = chart ? chart.trim() : '';
  
  // 生成稳定的图表 ID
  const chartId = id || `mermaid-chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 安全更新状态的函数
  const safeSetState = useCallback((setter) => {
    if (isMountedRef.current) {
      try {
        setter();
      } catch (error) {
        console.warn('状态更新错误:', error);
      }
    }
  }, []);

  // 清理定时器
  const cleanupTimeout = useCallback(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
      renderTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      cleanupTimeout();
    };
  }, [cleanupTimeout]);

  useEffect(() => {
    cleanupTimeout();
    
    if (!chartContent) {
      safeSetState(() => {
        setRenderState('error');
        setErrorMessage('没有图表内容');
        setSvgContent('');
      });
      return;
    }

    console.log('开始渲染 Mermaid 图表:', chartId);
    safeSetState(() => {
      setRenderState('loading');
      setErrorMessage('');
      setSvgContent('');
    });

    const renderChart = async () => {
      if (!isMountedRef.current) {
        console.log('组件已卸载，跳过渲染');
        return;
      }

      try {
        console.log('正在初始化 Mermaid...');
        
        // 对于 Mermaid 11.x，只初始化一次
        if (!isInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            themeVariables: {
              primaryColor: '#1890ff',
              primaryTextColor: '#262626',
              primaryBorderColor: '#d9d9d9',
              lineColor: '#595959',
              sectionBkgColor: '#f6f8fa',
              altSectionBkgColor: '#ffffff',
              gridColor: '#e1e4e8',
              secondaryColor: '#f0f2f5',
              tertiaryColor: '#fafafa'
            }
          });
          isInitialized = true;
        }

        console.log('Mermaid 初始化完成，开始渲染...');
        
        // 使用唯一ID避免冲突
        const uniqueId = `${chartId}-${Date.now()}`;
        
        console.log('调用 mermaid.render...');
        
        // 对于 Mermaid 11.x，使用 mermaid.render 方法
        const { svg } = await mermaid.render(uniqueId, chartContent);
        
        console.log('图表渲染完成，设置 SVG 内容...');
        
        if (isMountedRef.current && svg) {
          safeSetState(() => {
            setSvgContent(svg);
            setRenderState('success');
          });
          console.log('SVG 内容设置完成');
        }
          
      } catch (error) {
        console.error('Mermaid 渲染失败:', error);
        
        if (!isMountedRef.current) {
          return;
        }
        
        // 尝试修复语法问题
        try {
          console.log('尝试修复语法并重新渲染...');
          let fixedChart = chartContent;
          
          // 修复 subgraph 括号问题
          fixedChart = fixedChart.replace(/subgraph\s+([^(]+)\s*\([^)]+\)/g, (match, p1) => {
            return `subgraph "${p1.trim()}"`;
          });
          
          // 修复其他常见问题
          fixedChart = fixedChart.replace(/subgraph\s+([^"\n\r;]+?)(\s|$|;)/g, 'subgraph "$1"$2');
          
          const fixedId = `${chartId}-fixed-${Date.now()}`;
          const { svg } = await mermaid.render(fixedId, fixedChart);
          
          if (isMountedRef.current && svg) {
            safeSetState(() => {
              setSvgContent(svg);
              setRenderState('success');
            });
            console.log('修复后渲染成功');
          }
          
        } catch (retryError) {
          console.error('修复后仍然失败:', retryError);
          if (isMountedRef.current) {
            safeSetState(() => {
              setRenderState('error');
              setErrorMessage(`渲染失败: ${retryError.message}`);
              setSvgContent('');
            });
          }
        }
      }
    };

    // 延迟渲染，确保 DOM 准备就绪
    renderTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.log('开始执行渲染函数...');
        renderChart().catch(error => {
          console.error('异步渲染错误:', error);
          if (isMountedRef.current) {
            safeSetState(() => {
              setRenderState('error');
              setErrorMessage(`异步渲染失败: ${error.message}`);
              setSvgContent('');
            });
          }
        });
      }
    }, 200);
    
    return () => {
      cleanupTimeout();
    };
  }, [chartContent, chartId, safeSetState, cleanupTimeout]);

  console.log('MermaidChart 渲染状态:', renderState);

  if (renderState === 'error') {
    return (
      <div style={{
        margin: '20px 0',
        padding: '16px',
        border: '1px solid #ffccc7',
        borderRadius: '6px',
        background: '#fff1f0',
        color: '#cf1322',
        textAlign: 'center',
        fontSize: '13px',
      }}>
        <strong>📊 图表渲染失败</strong>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      margin: '20px 0',
      padding: '16px',
      border: '1px solid #e1e4e8',
      borderRadius: '6px',
      background: '#fafafa',
      overflow: 'auto',
      minHeight: '120px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          textAlign: 'center'
        }}
      >
        {renderState === 'loading' && (
          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
            🔄 正在渲染图表...
          </div>
        )}
        {renderState === 'success' && svgContent && (
          <div 
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={{ width: '100%' }}
          />
        )}
      </div>
    </div>
  );
});

MermaidChart.displayName = 'MermaidChart';

// 导出带错误边界的组件
const MermaidChartWithBoundary = (props) => (
  <MermaidErrorBoundary>
    <MermaidChart {...props} />
  </MermaidErrorBoundary>
);

export default MermaidChartWithBoundary; 