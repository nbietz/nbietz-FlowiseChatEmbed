import { createSignal, Show, splitProps, onCleanup, createEffect } from 'solid-js';
import styles from '../../../assets/index.css';
import { BubbleButton } from './BubbleButton';
import { BubbleParams } from '../types';
import { Bot, BotProps } from '../../../components/Bot';
import Tooltip from './Tooltip';
import { getBubbleButtonSize } from '@/utils';
import AvatarSessionManager from '@/services/AvatarSessionManager';

const defaultButtonColor = '#3B81F6';
const defaultIconColor = 'white';

export type BubbleProps = BotProps & BubbleParams;

export const Bubble = (props: BubbleProps) => {
  const [bubbleProps, otherProps] = splitProps(props, ['theme']);
  console.log('[Bubble] Avatar configuration:', props.theme?.chatWindow?.avatar);

  const [isBotOpened, setIsBotOpened] = createSignal(false);
  const [isBotStarted, setIsBotStarted] = createSignal(false);
  const [hasSpokenWelcome, setHasSpokenWelcome] = createSignal(false);
  const [buttonPosition, setButtonPosition] = createSignal({
    bottom: bubbleProps.theme?.button?.bottom ?? 20,
    right: bubbleProps.theme?.button?.right ?? 20,
  });
  const [isAvatarReady, setIsAvatarReady] = createSignal(false);

  // Log avatar configuration for debugging
  createEffect(() => {
    console.log('[Bubble] Avatar configuration:', props.avatar);
  });

  // Create an effect to monitor avatar readiness and speak welcome message
  createEffect(() => {
    console.log('[Bubble] Checking conditions for welcome message:', {
      isBotOpened: isBotOpened(),
      isAvatarReady: isAvatarReady(),
      hasSpokenWelcome: hasSpokenWelcome(),
    });

    const avatarManager = AvatarSessionManager.getInstance();
    if (isBotOpened() && isAvatarReady() && !hasSpokenWelcome()) {
      console.log('[Bubble] Avatar is ready and bot is opened, attempting welcome message');
      speakWelcomeMessage();
    }
  });

  const speakWelcomeMessage = async () => {
    const welcomeMessage = props.theme?.chatWindow?.welcomeMessage;
    console.log('[Bubble] Checking welcome message conditions:', {
      hasSpokenWelcome: hasSpokenWelcome(),
      welcomeMessage,
      themeConfig: props.theme?.chatWindow,
      isAvatarReady: isAvatarReady(),
    });

    if (hasSpokenWelcome()) {
      console.log('[Bubble] Welcome message already spoken, skipping');
      return;
    }

    if (!welcomeMessage) {
      console.log('[Bubble] No welcome message configured in theme, skipping');
      return;
    }

    const avatarManager = AvatarSessionManager.getInstance();
    console.log('[Bubble] Avatar session active:', avatarManager.isSessionActive());

    if (avatarManager.isSessionActive() && isAvatarReady()) {
      try {
        console.log('[Bubble] Attempting to speak welcome message:', welcomeMessage);
        await avatarManager.speak(welcomeMessage);
        console.log('[Bubble] Successfully spoke welcome message');
        setHasSpokenWelcome(true);
      } catch (error) {
        console.error('[Bubble] Error speaking welcome message:', error);
      }
    } else {
      console.log('[Bubble] Avatar not ready or session not active, cannot speak welcome message');
    }
  };

  const openBot = () => {
    console.log('[Bubble] Opening bot with theme config:', props.theme?.chatWindow);
    setIsBotStarted(true);
    // Use a small delay to ensure the Bot component is mounted before opening
    requestAnimationFrame(() => {
      console.log('[Bubble] Setting bot opened');
      setIsBotOpened(true);
    });
  };

  const closeBot = () => {
    console.log('[Bubble] Closing bot');
    // End avatar session when chat window is closed
    const avatarManager = AvatarSessionManager.getInstance();
    if (avatarManager.isSessionActive()) {
      console.log('[Bubble] Ending active avatar session');
      avatarManager.endSession().catch((error: Error) => {
        console.error('[Bubble] Error ending avatar session on close:', error);
      });
    }
    setIsBotOpened(false);
  };

  const toggleBot = () => {
    console.log('[Bubble] Toggling bot');
    isBotOpened() ? closeBot() : openBot();
  };

  onCleanup(() => {
    console.log('[Bubble] Cleaning up');
    setIsBotStarted(false);
  });

  // Add an effect to listen for avatar stream ready event
  createEffect(() => {
    if (!isBotStarted()) return;

    console.log('[Bubble] Setting up stream ready listener, bot started:', isBotStarted());
    const avatarManager = AvatarSessionManager.getInstance();

    // Clear any existing callbacks when the effect re-runs
    avatarManager.clearStreamReadyCallbacks();

    console.log('[Bubble] Registering stream ready callback');
    avatarManager.onStreamReady((stream) => {
      console.log('[Bubble] Stream ready callback triggered');
      setIsAvatarReady(true);
      console.log('[Bubble] isAvatarReady set to:', isAvatarReady());
    });
  });

  const buttonSize = getBubbleButtonSize(props.theme?.button?.size); // Default to 48px if size is not provided
  const buttonBottom = props.theme?.button?.bottom ?? 20;
  const chatWindowBottom = buttonBottom + buttonSize + 10; // Adjust the offset here for slight shift

  // Add viewport meta tag dynamically
  createEffect(() => {
    console.log('[Bubble] Initial effect running');
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, interactive-widget=resizes-content';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  });

  const showTooltip = bubbleProps.theme?.tooltip?.showTooltip ?? false;

  return (
    <>
      <Show when={props.theme?.customCSS}>
        <style>{props.theme?.customCSS}</style>
      </Show>
      <style>{styles}</style>
      <Tooltip
        showTooltip={showTooltip && !isBotOpened()}
        position={buttonPosition()}
        buttonSize={buttonSize}
        tooltipMessage={bubbleProps.theme?.tooltip?.tooltipMessage}
        tooltipBackgroundColor={bubbleProps.theme?.tooltip?.tooltipBackgroundColor}
        tooltipTextColor={bubbleProps.theme?.tooltip?.tooltipTextColor}
        tooltipFontSize={bubbleProps.theme?.tooltip?.tooltipFontSize} // Set the tooltip font size
      />
      <BubbleButton
        {...bubbleProps.theme?.button}
        toggleBot={toggleBot}
        isBotOpened={isBotOpened()}
        setButtonPosition={setButtonPosition}
        dragAndDrop={bubbleProps.theme?.button?.dragAndDrop ?? false}
        autoOpen={bubbleProps.theme?.button?.autoWindowOpen?.autoOpen ?? false}
        openDelay={bubbleProps.theme?.button?.autoWindowOpen?.openDelay}
        autoOpenOnMobile={bubbleProps.theme?.button?.autoWindowOpen?.autoOpenOnMobile ?? false}
      />
      <div
        part="bot"
        style={{
          height: bubbleProps.theme?.chatWindow?.height
            ? `${bubbleProps.theme?.chatWindow?.height + (bubbleProps.theme?.chatWindow?.avatar && isBotStarted() ? 400 : 0)}px`
            : 'calc(100% - 150px)',
          width: bubbleProps.theme?.chatWindow?.width ? `${bubbleProps.theme?.chatWindow?.width.toString()}px` : undefined,
          transition: 'transform 200ms cubic-bezier(0, 1.2, 1, 1), opacity 150ms ease-out, height 200ms ease-out',
          'transform-origin': 'bottom right',
          transform: isBotOpened() ? 'scale3d(1, 1, 1)' : 'scale3d(0, 0, 1)',
          'box-shadow': 'rgb(0 0 0 / 16%) 0px 5px 40px',
          'background-color': bubbleProps.theme?.chatWindow?.backgroundColor || '#ffffff',
          'background-image': bubbleProps.theme?.chatWindow?.backgroundImage ? `url(${bubbleProps.theme?.chatWindow?.backgroundImage})` : 'none',
          'background-size': 'cover',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          'z-index': 42424242,
          bottom: `${Math.min(buttonPosition().bottom + buttonSize + 10, window.innerHeight - chatWindowBottom)}px`,
          right: `${Math.max(0, Math.min(buttonPosition().right, window.innerWidth - (bubbleProps.theme?.chatWindow?.width ?? 410) - 10))}px`,
          'max-height': bubbleProps.theme?.chatWindow?.avatar && isBotStarted() ? 'calc(100vh - 100px)' : '704px',
          display: 'flex',
          'flex-direction': 'column',
        }}
        class={
          `fixed sm:right-5 rounded-lg w-full sm:w-[400px]` +
          (isBotOpened() ? ' opacity-1' : ' opacity-0 pointer-events-none') +
          ` bottom-${chatWindowBottom}px`
        }
      >
        <Show when={isBotStarted()}>
          <div class="relative h-full">
            <Show when={isBotOpened()}>
              <Bot
                class="rounded-lg border-[1px] border-[#eeeeee] shadow-md"
                chatflowid={props.chatflowid}
                apiHost={props.apiHost}
                avatar={props.theme?.chatWindow?.avatar}
                chatflowConfig={props.chatflowConfig}
                welcomeMessage={props.theme?.chatWindow?.welcomeMessage}
                botMessage={props.theme?.chatWindow?.botMessage}
                userMessage={props.theme?.chatWindow?.userMessage}
                textInput={props.theme?.chatWindow?.textInput}
                poweredByTextColor={props.theme?.chatWindow?.poweredByTextColor}
                badgeBackgroundColor={props.theme?.chatWindow?.badgeBackgroundColor}
                bubbleBackgroundColor={props.theme?.button?.backgroundColor}
                bubbleTextColor={props.theme?.button?.iconColor}
                title={props.theme?.chatWindow?.title}
                titleAvatarSrc={props.theme?.chatWindow?.titleAvatarSrc}
                fontSize={props.theme?.chatWindow?.fontSize}
                showTitle={props.theme?.chatWindow?.showTitle}
                showAgentMessages={props.theme?.chatWindow?.showAgentMessages}
                sourceDocsTitle={props.theme?.chatWindow?.sourceDocsTitle}
                feedback={props.theme?.chatWindow?.feedback}
                footer={props.theme?.footer}
                starterPrompts={props.theme?.chatWindow?.starterPrompts}
                starterPromptFontSize={props.theme?.chatWindow?.starterPromptFontSize}
                clearChatOnReload={props.theme?.chatWindow?.clearChatOnReload}
                disclaimer={props.theme?.chatWindow?.disclaimer}
                dateTimeToggle={props.theme?.chatWindow?.dateTimeToggle}
                renderHTML={props.theme?.chatWindow?.renderHTML}
                closeBot={closeBot}
              />
            </Show>
          </div>
        </Show>
      </div>
    </>
  );
};
