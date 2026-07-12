export type Route = "launcher" | "workspace" | "history";

type NavState = {
  stack: Route[];
  current: Route;
};

let state: NavState = {
  stack: ["launcher"],
  current: "launcher",
};

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export const navigation = {
  get: () => state,

  push(route: Route) {
    state = {
      stack: [...state.stack, route],
      current: route,
    };
    notify();
  },

  back() {
    if (state.stack.length <= 1) return;

    const newStack = state.stack.slice(0, -1);
    state = {
      stack: newStack,
      current: newStack[newStack.length - 1],
    };
    notify();
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};