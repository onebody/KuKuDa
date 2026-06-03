"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
/** 代理文本生成请求 */
router.post('/chat', async (req, res) => {
    const { config, body } = req.body;
    if (!config?.url || !config?.key) {
        res.status(400).json({
            code: 40001,
            data: null,
            message: '缺少 API 配置（url 或 key 为空）',
        });
        return;
    }
    try {
        const targetUrl = config.url.replace(/\/$/, '') + '/v1/chat/completions';
        logger_1.logger.info(`[AI Proxy] chat -> ${targetUrl}, model=${body.model}`);
        const upstream = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.key}`,
            },
            body: JSON.stringify(body),
        });
        const contentType = upstream.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const text = await upstream.text();
            logger_1.logger.warn(`[AI Proxy] non-JSON response: ${text.slice(0, 200)}`);
            res.status(502).json({
                code: 50201,
                data: null,
                message: `上游 API 返回非 JSON（HTTP ${upstream.status}）`,
            });
            return;
        }
        const data = await upstream.json();
        // Log upstream error details for debugging
        if (!upstream.ok && data?.error) {
            logger_1.logger.error('[AI Proxy] chat upstream error:', {
                status: upstream.status,
                url: targetUrl,
                error: data.error,
            });
        }
        res.json({
            code: upstream.ok ? 0 : upstream.status,
            data,
            message: upstream.ok
                ? 'success'
                : data.error?.message || data.error?.type || `HTTP ${upstream.status}`,
        });
    }
    catch (error) {
        logger_1.logger.error('[AI Proxy] chat error:', error.message);
        res.status(500).json({
            code: 50001,
            data: null,
            message: error.message || '代理请求失败',
        });
    }
});
/** 代理图片生成请求 */
router.post('/images', async (req, res) => {
    const { config, body } = req.body;
    if (!config?.url || !config?.key) {
        res.status(400).json({
            code: 40001,
            data: null,
            message: '缺少 API 配置（url 或 key 为空）',
        });
        return;
    }
    try {
        const targetUrl = config.url.replace(/\/$/, '') + '/v1/images/generations';
        logger_1.logger.info(`[AI Proxy] images -> ${targetUrl}, model=${body.model}`);
        const upstream = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.key}`,
            },
            body: JSON.stringify(body),
        });
        const contentType = upstream.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const text = await upstream.text();
            logger_1.logger.warn(`[AI Proxy] non-JSON response: ${text.slice(0, 200)}`);
            res.status(502).json({
                code: 50201,
                data: null,
                message: `上游 API 返回非 JSON（HTTP ${upstream.status}）`,
            });
            return;
        }
        const data = await upstream.json();
        // Log upstream error details for debugging
        if (!upstream.ok && data?.error) {
            logger_1.logger.error('[AI Proxy] images upstream error:', {
                status: upstream.status,
                url: targetUrl,
                error: data.error,
            });
        }
        res.json({
            code: upstream.ok ? 0 : upstream.status,
            data,
            message: upstream.ok
                ? 'success'
                : data.error?.message || data.error?.type || `HTTP ${upstream.status}`,
        });
    }
    catch (error) {
        logger_1.logger.error('[AI Proxy] images error:', error.message);
        res.status(500).json({
            code: 50001,
            data: null,
            message: error.message || '代理请求失败',
        });
    }
});
exports.default = router;
//# sourceMappingURL=aiRoutes.js.map