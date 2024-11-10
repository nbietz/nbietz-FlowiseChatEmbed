declare const chatbot: {
    initFull: (props: {
        chatflowid: string;
        apiHost?: string | undefined;
        onRequest?: ((request: RequestInit) => Promise<void>) | undefined;
        chatflowConfig?: Record<string, unknown> | undefined;
        observersConfig?: import("./components/Bot").observersConfigType | undefined;
        theme?: import("./features/bubble/types").BubbleTheme | undefined;
        showVideo?: boolean | undefined;
        interactiveAvatar?: {
            quality?: "medium" | "low" | "high" | undefined;
            avatarName?: string | undefined;
            voice?: {
                voiceId: string;
            } | undefined;
        } | undefined;
    } & {
        id?: string | undefined;
    }) => void;
    init: (props: {
        chatflowid: string;
        apiHost?: string | undefined;
        onRequest?: ((request: RequestInit) => Promise<void>) | undefined;
        chatflowConfig?: Record<string, unknown> | undefined;
        observersConfig?: import("./components/Bot").observersConfigType | undefined;
        theme?: import("./features/bubble/types").BubbleTheme | undefined;
        showVideo?: boolean | undefined;
        interactiveAvatar?: {
            quality?: "medium" | "low" | "high" | undefined;
            avatarName?: string | undefined;
            voice?: {
                voiceId: string;
            } | undefined;
        } | undefined;
    }) => void;
    destroy: () => void;
};
export default chatbot;
//# sourceMappingURL=web.d.ts.map