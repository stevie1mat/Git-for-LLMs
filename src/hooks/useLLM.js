import { useState, useCallback } from 'react';

/**
 * Custom hook for LLM API interactions
 * Handles communication with various LLM providers
 */
export function useLLM() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Sends a request to the LLM API
   * @param {Object[]} messages - Array of messages in OpenAI format
   * @param {Object} options - API options
   * @returns {Promise<string>} LLM response
   */
  const sendToLLM = useCallback(async (messages, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        model = 'gpt-4',
        temperature = 0.7,
        maxTokens = 2000,
        apiKey = process.env.REACT_APP_OPENAI_API_KEY
      } = options;

      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set REACT_APP_OPENAI_API_KEY in your environment.');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      const errorMessage = err.message || 'Failed to get response from LLM';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sends a request to Anthropic Claude API
   * @param {Object[]} messages - Array of messages
   * @param {Object} options - API options
   * @returns {Promise<string>} Claude response
   */
  const sendToClaude = useCallback(async (messages, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        model = 'claude-3-sonnet-20240229',
        maxTokens = 2000,
        apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY
      } = options;

      if (!apiKey) {
        throw new Error('Anthropic API key not found. Please set REACT_APP_ANTHROPIC_API_KEY in your environment.');
      }

      // Convert OpenAI format to Claude format
      const claudeMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          messages: claudeMessages,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (err) {
      const errorMessage = err.message || 'Failed to get response from Claude';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sends a request to Google Gemini API
   * @param {Object[]} messages - Array of messages
   * @param {Object} options - API options
   * @returns {Promise<string>} Gemini response
   */
  const sendToGemini = useCallback(async (messages, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        model = 'gemini-2.0-flash-exp',
        temperature = 0.7,
        maxTokens = 2000,
        apiKey = process.env.REACT_APP_GEMINI_API_KEY
      } = options;

      if (!apiKey) {
        throw new Error('Gemini API key not found. Please set REACT_APP_GEMINI_API_KEY in your environment.');
      }

      // Convert OpenAI format to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: 0.95,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      const errorMessage = err.message || 'Failed to get response from Gemini';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mock LLM response for development/testing
   * @param {Object[]} messages - Array of messages
   * @returns {Promise<string>} Mock response
   */
  const sendToMockLLM = useCallback(async (messages) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const lastMessage = messages[messages.length - 1];
      const response = `This is a mock response to: "${lastMessage.content}". In a real implementation, this would be sent to an actual LLM API.`;
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Mock LLM failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    sendToLLM,
    sendToClaude,
    sendToGemini,
    sendToMockLLM,
    clearError
  };
}
