package com.d1nvan.jdeepwiki.llm.service;

import static org.springframework.ai.chat.memory.ChatMemory.CONVERSATION_ID;

import org.slf4j.MDC;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.model.tool.ToolCallingChatOptions;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.stereotype.Service;

import com.alibaba.cloud.ai.memory.jdbc.SQLiteChatMemoryRepository;
import com.aliyuncs.utils.StringUtils;

import cn.hutool.core.lang.UUID;
import reactor.core.publisher.Flux;

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
                            .build();

        this.allTools = allTools;
    }

    public String callWithTools(String query) {
        return chatClient
                .prompt(query)
                .advisors(
                        a -> a.param(CONVERSATION_ID, UUID.randomUUID().toString())
                )
                .options(ToolCallingChatOptions.builder().toolCallbacks(allTools).build())
                .call()
                .content();
    }

    public String callWithoutTools(String query) {
        return chatClient
                .prompt(query)
                .advisors(
                        a -> a.param(CONVERSATION_ID, UUID.randomUUID().toString())
                        )
                .call()
                .content();
    }

    public Flux<String> chatWithTools(String query, String conversationId) {
        return chatClient
                .prompt(query)
                .advisors(a -> a.param(CONVERSATION_ID, StringUtils.isEmpty(conversationId) ? MDC.get("traceId") : conversationId))
                .options(
                    ToolCallingChatOptions.builder().toolCallbacks(allTools).build())
                .stream()
                .content();
    }

    public Flux<String> chatWithModelAndTools(String query, String model, String conversationId) {
        return chatClient
                .prompt(query)
                .advisors(a -> a.param(CONVERSATION_ID,
                        StringUtils.isEmpty(conversationId) ? MDC.get("traceId") : conversationId))
                .options(
                        OpenAiChatOptions.builder()
                        .model(model)
                        .toolCallbacks(allTools)
                        .build()
                        )
                .stream()
                .content();
    }

}
