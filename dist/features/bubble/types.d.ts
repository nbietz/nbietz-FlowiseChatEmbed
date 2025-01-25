import { AvatarConfig } from '../../services/AvatarSessionManager';
export type BubbleParams = {
    theme?: BubbleTheme;
    avatar?: AvatarConfig;
};
export type BubbleTheme = {
    chatWindow?: ChatWindowTheme;
    button?: ButtonTheme;
    tooltip?: ToolTipTheme;
    disclaimer?: DisclaimerPopUpTheme;
    customCSS?: string;
};
export type TextInputTheme = {
    backgroundColor?: string;
    textColor?: string;
    placeholder?: string;
    sendButtonColor?: string;
    maxChars?: number;
    maxCharsWarningMessage?: string;
    autoFocus?: boolean;
    sendMessageSound?: boolean;
    sendSoundLocation?: string;
    receiveMessageSound?: boolean;
    receiveSoundLocation?: string;
};
export type UserMessageTheme = {
    backgroundColor?: string;
    textColor?: string;
    showAvatar?: boolean;
    avatarSrc?: string;
};
export type BotMessageTheme = {
    backgroundColor?: string;
    textColor?: string;
    showAvatar?: boolean;
    avatarSrc?: string;
};
export type FooterTheme = {
    showFooter?: boolean;
    textColor?: string;
    text?: string;
    company?: string;
    companyLink?: string;
};
export type FeedbackTheme = {
    color?: string;
};
export type ChatWindowTheme = {
    backgroundColor?: string;
    backgroundImage?: string;
    height?: number;
    width?: number;
    fontSize?: number;
    poweredByTextColor?: string;
    botMessage?: BotMessageTheme;
    userMessage?: UserMessageTheme;
    welcomeMessage?: string;
    errorMessage?: string;
    textInput?: TextInputTheme;
    feedback?: FeedbackTheme;
    title?: string;
    titleAvatarSrc?: string;
    titleBackgroundColor?: string;
    titleTextColor?: string;
    showTitle?: boolean;
    showAgentMessages?: boolean;
    footer?: FooterTheme;
    sourceDocsTitle?: string;
    starterPrompts?: string[];
    starterPromptFontSize?: number;
    clearChatOnReload?: boolean;
    disclaimer?: DisclaimerPopUpTheme;
    dateTimeToggle?: DateTimeToggleTheme;
    renderHTML?: boolean;
    avatar?: AvatarConfig;
    badgeBackgroundColor?: string;
};
export type ButtonTheme = {
    size?: 'small' | 'medium' | 'large' | number;
    backgroundColor?: string;
    iconColor?: string;
    customIconSrc?: string;
    bottom?: number;
    right?: number;
    dragAndDrop?: boolean;
    autoWindowOpen?: autoWindowOpenTheme;
};
export type ToolTipTheme = {
    showTooltip?: boolean;
    tooltipMessage?: string;
    tooltipBackgroundColor?: string;
    tooltipTextColor?: string;
    tooltipFontSize?: number;
};
export type autoWindowOpenTheme = {
    autoOpen?: boolean;
    openDelay?: number;
    autoOpenOnMobile?: boolean;
};
export type DisclaimerPopUpTheme = {
    title?: string;
    message?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonText?: string;
    blurredBackgroundColor?: string;
    backgroundColor?: string;
    denyButtonBgColor?: string;
    denyButtonText?: string;
};
export type DateTimeToggleTheme = {
    date?: boolean;
    time?: boolean;
};
//# sourceMappingURL=types.d.ts.map