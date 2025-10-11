import { TUIStore, StoreName } from "@tencentcloud/chat-uikit-engine-lite";
export function enableSampleTaskStatus(taskKey: string) {
  const tasks = TUIStore.getData(StoreName.APP, "tasks");
  if (taskKey in tasks && !tasks[taskKey]) {
    tasks[taskKey] = true;
    TUIStore.update(StoreName.APP, "tasks", tasks);
  }
}
