import { useEffect, useReducer } from "react";

type QueueReturnType = [string[], (queueItem: string) => void];
type QueueFn = (item: string, done: () => void) => void;
type ReducerState = {
  isAdding: boolean;
  queue: any[];
};
type ReducerAction = {
  type: string;
  queueItem?: any;
};

const initialState = {
  isAdding: false,
  queue: [],
};

const useQueue = (queueFn: QueueFn): QueueReturnType => {
  const [{ isAdding, queue }, dispatch] = useReducer(
    (state: ReducerState, action: ReducerAction) => {
      switch (action.type) {
        case "ADD_TO_QUEUE":
          return {
            ...state,
            queue: [...state.queue, action.queueItem],
          };
        case "ADDING_TO_QUEUE":
          return {
            ...state,
            isAdding: true,
          };
        case "REMOVE_FROM_QUEUE":
          return {
            isAdding: false,
            queue: state.queue.slice(1),
          };
        default:
          return state;
      }
    },
    initialState
  );

  const addQueueItem = (queueItem: string) => {
    dispatch({
      queueItem,
      type: "ADD_TO_QUEUE",
    });
  };

  useEffect(() => {
    if (queue.length > 0 && !isAdding) {
      dispatch({
        type: "ADDING_TO_QUEUE",
      });

      queueFn(queue[0], async () => {
        dispatch({
          type: "REMOVE_FROM_QUEUE",
        });
      });
    }
  }, [queue, isAdding]);

  return [queue, addQueueItem];
};

export default useQueue;
