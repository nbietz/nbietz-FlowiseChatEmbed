import type { BotProps } from './window';
export default class Chatbot {
    static init(config: BotProps): Promise<{
        initFull: (props: BotProps & {
            id?: string | undefined;
        }) => void;
        init: (props: BotProps) => void;
        destroy: () => void;
    }>;
}
//# sourceMappingURL=web.d.ts.map