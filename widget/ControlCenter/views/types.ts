export const Views = {
  Main: 0,
};

export type ViewId = typeof Views[keyof typeof Views];
export type ViewContentProps = { viewId: ViewId, changeView(viewId: ViewId): void; }
