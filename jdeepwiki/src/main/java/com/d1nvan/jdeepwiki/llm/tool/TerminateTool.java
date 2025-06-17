package com.d1nvan.jdeepwiki.llm.tool;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

@Service
public class TerminateTool {
  
    @Tool(description = """  
            When the request is satisfied or the assistant cannot continue to execute the task, terminate the interaction. 
            "Call this tool to end work after completing all tasks." 
            """)  
    public String doTerminate() {  
        return "Task completed";  
    }  
}
