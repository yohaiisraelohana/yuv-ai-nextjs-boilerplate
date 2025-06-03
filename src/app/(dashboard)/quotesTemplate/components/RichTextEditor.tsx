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
  AlignJustify,
  TextIcon,
  Languages,
  Building2,
  User,
  Package,
  Receipt,
  Signature,
} from "lucide-react";

const PREDEFINED_VARIABLES = [
  {
    category: "פרטי החברה",
    variables: [
      { name: "companyName", description: "שם החברה" },
      { name: "companyLogo", description: "לוגו החברה" },
      { name: "companyAddress", description: "כתובת החברה" },
      { name: "companyPhone", description: "טלפון החברה" },
      { name: "companyEmail", description: "אימייל החברה" },
      { name: "companySignature", description: "חתימת החברה" },
    ],
  },
  {
    category: "פרטי הצעת המחיר",
    variables: [
      { name: "quoteNumber", description: "מספר הצעת מחיר" },
      { name: "quoteDate", description: "תאריך הצעת המחיר" },
      { name: "quoteValidUntil", description: "תוקף הצעת המחיר" },
      { name: "quoteTotal", description: "סכום כולל" },
      { name: "quoteDiscount", description: "הנחה" },
      { name: "quoteFinalTotal", description: "סכום סופי" },
    ],
  },
  {
    category: "פרטי הלקוח",
    variables: [
      { name: "clientName", description: "שם הלקוח" },
      { name: "clientAddress", description: "כתובת הלקוח" },
      { name: "clientPhone", description: "טלפון הלקוח" },
      { name: "clientEmail", description: "אימייל הלקוח" },
      { name: "clientSignature", description: "חתימת הלקוח" },
    ],
  },
  {
    category: "טבלת מוצרים",
    variables: [
      { name: "productsTable", description: "טבלת מוצרים מלאה" },
      { name: "productName", description: "שם המוצר" },
      { name: "productQuantity", description: "כמות" },
      { name: "productPrice", description: "מחיר ליחידה" },
      { name: "productTotal", description: "סכום" },
    ],
  },
];

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isRTL, setIsRTL] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2 bg-gray-100",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        dir: isRTL ? "rtl" : "ltr",
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
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

  const toggleRTL = () => {
    setIsRTL(!isRTL);
    editor?.chain().focus().run();
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
        {PREDEFINED_VARIABLES.map((category) => (
          <div key={category.category} className="relative group">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setActiveCategory(
                  activeCategory === category.category
                    ? null
                    : category.category
                )
              }
              className={activeCategory === category.category ? "bg-muted" : ""}
            >
              {category.category}
            </Button>
            {activeCategory === category.category && (
              <div className="absolute top-full right-0 mt-1 bg-popover text-popover-foreground p-2 rounded shadow-lg z-50 min-w-[200px]">
                {category.variables.map((variable) => (
                  <Button
                    key={variable.name}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      insertVariable(variable.name);
                      setActiveCategory(null);
                    }}
                  >
                    {variable.description}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

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
                  editor?.chain().focus().setTextAlign("justify").run()
                }
                className={
                  editor?.isActive({ textAlign: "justify" }) ? "bg-muted" : ""
                }
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRTL}
                className={isRTL ? "bg-muted" : ""}
              >
                <Languages className="h-4 w-4" />
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
