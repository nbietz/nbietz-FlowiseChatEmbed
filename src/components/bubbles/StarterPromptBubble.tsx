type Props = {
  prompt: string;
  onPromptClick?: () => void;
  starterPromptFontSize?: number;
};
export const StarterPromptBubble = (props: Props) => (
  <div
    data-modal-target="defaultModal"
    data-modal-toggle="defaultModal"
    class="flex-shrink-0 flex justify-start items-start animate-fade-in host-container hover:brightness-90 active:brightness-75"
    onClick={() => props.onPromptClick?.()}
  >
    <span
      class="px-3 py-2 ml-1 chatbot-host-bubble"
      data-testid="host-bubble"
      style={{
        'font-size': props.starterPromptFontSize ? `${props.starterPromptFontSize}px` : '15px',
        'border-radius': '20px',
        cursor: 'pointer',
        display: 'inline-flex',
        'align-items': 'center',
        'white-space': 'pre-wrap',
        'overflow-wrap': 'break-word',
        'word-break': 'break-word',
        'min-width': '0',
        'max-width': '100%',
        'line-height': '1.4'
      }}
    >
      {props.prompt}
    </span>
  </div>
);
