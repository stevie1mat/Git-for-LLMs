# Hierarchical Memory System Test

This document demonstrates how the hierarchical memory system works in ChaTree.

## Scenario: Salad Benefits Memory Issue

### The Problem
In the original system, when you asked "did i ask you for the benefits of salad?" from the main branch, the AI responded "No, you haven't asked me about the benefits of salad yet" even though you had asked about salad benefits in a sub-branch.

### The Solution: Hierarchical Memory System

#### Memory Rules:
1. **Main Branch**: Has memory of ALL sub-branches (hierarchical memory)
2. **Sub-branches**: Have isolated memory (no knowledge of other sub-branches)

#### How It Works:

1. **When in a Sub-branch**:
   - Context includes: Pinned nodes + Ancestor path only
   - Memory type: `isolated`
   - Cannot see other sub-branch conversations

2. **When in Main Branch**:
   - Context includes: Pinned nodes + Ancestor path + ALL descendants
   - Memory type: `hierarchical` 
   - Can see all sub-branch conversations

### Test Scenario:

```
Main Branch: "Hello! How can I help you today?"
├── Sub-branch 1: "make the recipe for salad with 100 calories"
│   └── "what are the benefits" → "Here are the benefits..."
├── Sub-branch 2: "2 places to visit in toronto"
│   └── "Here are two great places..."
└── Sub-branch 3: "did i ask you for the benefits of salad?"
    └── Should now respond: "Yes, you asked about salad benefits in a previous conversation"
```

### Implementation Details:

The `compileContext` function now:
1. Detects if the current node is in a sub-branch (`parentId !== null`)
2. For sub-branches: Only includes ancestor path (isolated memory)
3. For main branch: Includes ancestor path + all descendants (hierarchical memory)

### UI Changes:

The context panel now shows:
- Memory type indicator: "🧠 Main Branch (Full Memory)" or "🔒 Sub-Branch (Isolated Memory)"
- Sub-branch memories count (when in main branch)
- Visual distinction between memory types

### Testing:

To test this system:
1. Create a conversation tree with multiple sub-branches
2. Ask about something in one sub-branch
3. Switch to main branch and ask if you asked about that topic
4. The main branch should now remember the sub-branch conversation
5. Sub-branches should remain isolated from each other
