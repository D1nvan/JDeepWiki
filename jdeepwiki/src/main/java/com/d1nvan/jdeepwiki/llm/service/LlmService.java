package com.d1nvan.jdeepwiki.llm.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.model.tool.ToolCallingChatOptions;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.stereotype.Service;

import com.alibaba.cloud.ai.memory.jdbc.SQLiteChatMemoryRepository;
import com.aliyuncs.utils.StringUtils;

import cn.hutool.core.lang.UUID;
import static org.springframework.ai.chat.memory.ChatMemory.CONVERSATION_ID;

@Service
public class LlmService {
    
    private ChatClient chatClient;
    private MessageWindowChatMemory chatMemory;
    private final int MAX_HISTORY_MESSAGES = 20;
    private ToolCallback[] allTools;
    
    public LlmService(ChatClient.Builder chatClientBuilder, SQLiteChatMemoryRepository sqLiteChatMemoryRepository, ToolCallback[] allTools){
        this.chatMemory = MessageWindowChatMemory.builder()
                            .chatMemoryRepository(sqLiteChatMemoryRepository)
                            .maxMessages(MAX_HISTORY_MESSAGES)
                            .build();

        this.chatClient = chatClientBuilder
                            .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                            .defaultOptions(ToolCallingChatOptions.builder().toolCallbacks(allTools).build())
                            .build();

        this.allTools = allTools;
    }

    public String call(String query, String conversationId){
        return chatClient
                .prompt(query)
                .advisors(a -> a.param(CONVERSATION_ID, StringUtils.isEmpty(conversationId) ? UUID.randomUUID().toString() : conversationId))
                .options(ToolCallingChatOptions.builder().toolCallbacks(allTools).build())
                .call()
                .content();
    }

}
