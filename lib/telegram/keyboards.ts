import { sessionButton } from "@/lib/telegram/session";

export const adminKeyboard = {
  inline_keyboard: [
    [{ text: "Homepage", callback_data: "cmd:home" }, { text: "About", callback_data: "cmd:about" }],
    [{ text: "Projects", callback_data: "cmd:projects" }, { text: "Writing", callback_data: "cmd:writing" }],
    [{ text: "Research", callback_data: "cmd:research" }, { text: "Now", callback_data: "cmd:now" }],
    [{ text: "Media", callback_data: "cmd:media" }, { text: "Navigation", callback_data: "cmd:navigation" }],
    [{ text: "Settings", callback_data: "cmd:settings" }, { text: "SEO", callback_data: "cmd:seo" }],
    [{ text: "Preview", callback_data: "cmd:preview" }, { text: "Publish", callback_data: "cmd:publish" }],
    [{ text: "History", callback_data: "cmd:history" }, { text: "Backup", callback_data: "cmd:backup" }],
    [{ text: "Help", callback_data: "help" }],
  ],
};

export function cancelKeyboard() {
  return { inline_keyboard: [[{ text: "Cancel", callback_data: "cmd:cancel" }]] };
}

export function confirmKeyboard(token: string) {
  return { inline_keyboard: [[sessionButton(token, "Publish", "publish"), sessionButton(token, "Edit", "edit")], [{ text: "Cancel", callback_data: "cmd:cancel" }]] };
}

export function collectionKeyboard(collection: string) {
  return { inline_keyboard: [[{ text: "List", callback_data: `collection:list:${collection}` }, { text: "Add", callback_data: `collection:add:${collection}` }], [{ text: "Cancel", callback_data: "cmd:cancel" }]] };
}
