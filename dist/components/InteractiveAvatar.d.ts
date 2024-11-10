type InteractiveAvatarProps = {
    onSpeakReady: (speakFunction: (text: string) => void) => void;
    quality?: 'low' | 'medium' | 'high';
    avatarName?: string;
    voiceId?: string;
};
export default function InteractiveAvatar(props: InteractiveAvatarProps): import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=InteractiveAvatar.d.ts.map