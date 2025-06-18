package com.d1nvan.jdeepwiki.config;

import org.springframework.ai.support.ToolCallbacks;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.d1nvan.jdeepwiki.llm.tool.FileSystemTool;
import com.d1nvan.jdeepwiki.llm.tool.TerminalTool;

@Configuration
public class ToolRegistration {

    @Bean
    public ToolCallback[] allTools(){
        FileSystemTool fileOperationTool = new FileSystemTool();
        TerminalTool terminalOperationTool = new TerminalTool();
        return ToolCallbacks.from(
                fileOperationTool,
                terminalOperationTool
                );    
    }
    
}
