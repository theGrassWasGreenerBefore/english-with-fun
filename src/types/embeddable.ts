// Contract implemented by every vanilla (non-React) embeddable module
// (video player, mini-game). See AGENTS.md section 4.
export interface EmbeddableModule<TConfig = unknown> {
  init(container: HTMLElement, config: TConfig): Promise<void>;
  destroy(): void;
}
