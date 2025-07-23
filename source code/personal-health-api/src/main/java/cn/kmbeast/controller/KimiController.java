package cn.kmbeast.controller;

import cn.kmbeast.pojo.api.ApiResult;
import cn.kmbeast.pojo.api.Result;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import okhttp3.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping(value = "/kimi")
public class KimiController {
    private static final MediaType mediaType = MediaType.get("application/json; charset=utf-8");
    private static final String API_URL = "https://api.moonshot.cn/v1/chat/completions";
    // 替换为你的 API Key
    private static final String API_KEY = "xxxx";

    private static JSONObject createRequestBody(String question) {
        JSONObject requestBody = new JSONObject();
        JSONArray messages = new JSONArray();
        JSONObject systemMessage = new JSONObject();
        systemMessage.put("content", "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。");
        systemMessage.put("role", "system");
        messages.add(systemMessage);
        JSONObject userMessage = new JSONObject();
        userMessage.put("content", question);
        userMessage.put("role", "user");
        messages.add(userMessage);
        requestBody.put("messages", messages);
        requestBody.put("model", "moonshot-v1-8k");
        requestBody.put("temperature", 0.9);
        return requestBody;
    }

    private static String sendPostRequest(JSONObject jsonBody) throws IOException {
        // 创建OkHttpClient并设置超时时间
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(1, TimeUnit.MINUTES)  // 连接超时
                .readTimeout(1, TimeUnit.MINUTES)     // 读取超时
                .writeTimeout(1, TimeUnit.MINUTES)    // 写入超时
                .build();
        String jsonString = jsonBody.toString();
        RequestBody body = RequestBody.create(jsonString, mediaType);
        Request request = new Request.Builder()
                .url(KimiController.API_URL)
                .post(body)
                .addHeader("Authorization", "Bearer " + API_KEY)
                .build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
            return response.body().string();
        }
    }

    /**
     * 调用DeepSeekAI接口
     *
     * @return Result<String>
     */
    @PostMapping(value = "/seek")
    public Result<String> ask(@org.springframework.web.bind.annotation.RequestBody Map<String, String> request) throws IOException {
        JSONObject requestBody = createRequestBody(request.get("question"));
        String response = sendPostRequest(requestBody);
        String parseJson = parse(response);
        return ApiResult.success(parseJson);
    }


    private static String parse(String jsonResponse){
        // 解析JSON字符串
        JSONObject jsonObject = JSON.parseObject(jsonResponse);

        // 获取choices数组
        JSONArray choices = jsonObject.getJSONArray("choices");

        JSONObject choice = choices.getJSONObject(0);
        JSONObject message = choice.getJSONObject("message");
        // 提取message对象中的字段
        String role = message.getString("role");
        return message.getString("content");
    }
}
