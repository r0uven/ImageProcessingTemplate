import { useSyncExternalStore } from "react";
import { navigation } from "./navigationStore";

export const useNavigation = () => {
  const state = useSyncExternalStore(
    navigation.subscribe,
    navigation.get,
    navigation.get
  );

  return {
    route: state.current,
    canGoBack: state.stack.length > 1,
    goBack: navigation.back,
    goTo: navigation.push,
  };
};