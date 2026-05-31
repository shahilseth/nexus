import { Router, Request, Response } from "express";

const router = Router();

const FAQ_DATA = {
  faqs: [
    {
      q: "How do I create a project?",
      a: "Click the '+ New Project' button on the Projects page. Give your project a name, an optional description, and a due date, then hit Create. Your project will appear in the grid right away.",
    },
    {
      q: "How do I assign tasks to someone?",
      a: "Open any project and go to the Kanban board. Click a task card to open the detail panel, then use the Assignee field to pick a team member. Only people who are members of that project will appear in the list.",
    },
    {
      q: "What is the difference between Admin and Member?",
      a: "Admins can create and delete projects, invite or remove members, and see all tasks across the workspace. Members can only see and update tasks assigned to them within projects they belong to.",
    },
    {
      q: "How do I move a task between Kanban columns?",
      a: "Drag and drop a task card from one column to another. On mobile you can also tap the card to open it and use the 'Move to' dropdown in the detail panel to change its status.",
    },
    {
      q: "How do I invite someone to a project?",
      a: "Open the project, scroll to the Members section, and click 'Invite member'. Type their email address and choose a role. They will be added to the project immediately.",
    },
    {
      q: "How do I change my password?",
      a: "Go to Settings (gear icon in the sidebar or navigation menu) and scroll to the 'Change password' section. Enter your current password and your new password twice, then click Update password.",
    },
  ],
  shortcuts: [
    { keys: "⌘K", description: "Open the command palette to quickly navigate or create" },
    { keys: "Esc", description: "Close any open modal, panel, or palette" },
  ],
  contact: {
    email: "support@nexus.app",
  },
};

router.get("/faqs", (_req: Request, res: Response) => {
  res.json(FAQ_DATA);
});

export default router;
