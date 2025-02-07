type Props = {
  prompt: string;
  onPromptClick?: () => void;
  starterPromptFontSize?: number;
};
export const FollowUpPromptBubble = (props: Props) => (
  <>
    <div
      data-modal-target="defaultModal"
      data-modal-toggle="defaultModal"
      class="flex justify-start items-start animate-fade-in gap-1 host-container hover:brightness-90 active:brightness-75"
      onClick={() => props.onPromptClick?.()}
    >
      <span
        class="px-2 py-1 chatbot-host-bubble border"
        data-testid="host-bubble"
        style={{
          'font-size': props.starterPromptFontSize ? `${props.starterPromptFontSize}px` : '15px',
          'border-radius': '15px',
          cursor: 'pointer',
          display: 'inline-block',
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'word-break': 'break-word',
          'min-width': '0',
          'max-width': '100%',
        }}
      >
        {props.prompt}
      </span>
    </div>
  </>
);
