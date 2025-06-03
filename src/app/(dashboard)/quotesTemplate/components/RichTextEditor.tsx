import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Strikethrough,
  Code,
  Quote,
  Undo,
  Redo,
  Rows,
  Columns,
  Trash2,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  variables: Array<{ name: string; description: string }>;
  onVariablesChange?: (
    variables: Array<{ name: string; description: string }>
  ) => void;
}

export function RichTextEditor({
  content,
  onChange,
  variables,
  onVariablesChange,
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const [newVariable, setNewVariable] = useState({ name: "", description: "" });
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    editorProps: {
      attributes: {
        dir: "rtl",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const insertVariable = (variableName: string) => {
    if (editor) {
      editor.commands.insertContent(`{{${variableName}}}`);
    }
  };

  const addVariable = () => {
    if (newVariable.name && newVariable.description) {
      const updatedVariables = [...variables, newVariable];
      onVariablesChange?.(updatedVariables);
      setNewVariable({ name: "", description: "" });
    }
  };

  const removeVariable = (index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    onVariablesChange?.(updatedVariables);
  };

  const addLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {variables.map((variable, index) => (
          <div key={variable.name} className="relative group">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertVariable(variable.name)}
              >
                {variable.name}
              </Button>
              <div
                className="absolute -right-2 -top-2 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center bg-background rounded-full border"
                onClick={(e) => {
                  e.stopPropagation();
                  removeVariable(index);
                }}
              >
                ×
              </div>
              <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg">
                  {variable.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {onVariablesChange && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">שם המשתנה</label>
            <input
              type="text"
              value={newVariable.name}
              onChange={(e) =>
                setNewVariable({ ...newVariable, name: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="לדוגמה: clientName"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">תיאור</label>
            <input
              type="text"
              value={newVariable.description}
              onChange={(e) =>
                setNewVariable({ ...newVariable, description: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="לדוגמה: שם הלקוח"
            />
          </div>
          <Button onClick={addVariable} size="sm">
            הוסף משתנה
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">עריכה</TabsTrigger>
          <TabsTrigger value="preview">תצוגה מקדימה</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Card className="p-4">
            <div className="border-b mb-4 pb-2 flex flex-wrap gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={editor?.isActive("bold") ? "bg-muted" : ""}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={editor?.isActive("italic") ? "bg-muted" : ""}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={editor?.isActive("underline") ? "bg-muted" : ""}
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                className={editor?.isActive("strike") ? "bg-muted" : ""}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleCode().run()}
                className={editor?.isActive("code") ? "bg-muted" : ""}
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={editor?.isActive("bulletList") ? "bg-muted" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                className={editor?.isActive("orderedList") ? "bg-muted" : ""}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={
                  editor?.isActive("heading", { level: 1 }) ? "bg-muted" : ""
                }
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={
                  editor?.isActive("heading", { level: 2 }) ? "bg-muted" : ""
                }
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={
                  editor?.isActive("heading", { level: 3 }) ? "bg-muted" : ""
                }
              >
                <Heading3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={editor?.isActive("blockquote") ? "bg-muted" : ""}
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor?.chain().focus().setTextAlign("left").run()
                }
                className={
                  editor?.isActive({ textAlign: "left" }) ? "bg-muted" : ""
                }
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor?.chain().focus().setTextAlign("center").run()
                }
                className={
                  editor?.isActive({ textAlign: "center" }) ? "bg-muted" : ""
                }
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor?.chain().focus().setTextAlign("right").run()
                }
                className={
                  editor?.isActive({ textAlign: "right" }) ? "bg-muted" : ""
                }
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3 })
                    .run()
                }
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().addColumnBefore().run()}
                disabled={!editor?.can().addColumnBefore()}
              >
                <Columns className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().addRowBefore().run()}
                disabled={!editor?.can().addRowBefore()}
              >
                <Rows className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteTable}
                disabled={!editor?.can().deleteTable()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="הכנס כתובת URL"
                  className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addLink}
                  disabled={!linkUrl}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="הכנס כתובת תמונה"
                  className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addImage}
                  disabled={!imageUrl}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
            <EditorContent
              editor={editor}
              className="min-h-[300px] prose max-w-none"
            />
          </Card>
        </TabsContent>
        <TabsContent value="preview">
          <Card className="p-4">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
