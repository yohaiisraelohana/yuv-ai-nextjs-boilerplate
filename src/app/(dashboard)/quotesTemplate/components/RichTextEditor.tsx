import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  variables: Array<{ name: string; description: string }>;
}

export function RichTextEditor({
  content,
  onChange,
  variables,
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState("edit");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const insertVariable = (variableName: string) => {
    if (editor) {
      editor.commands.insertContent(`{{${variableName}}}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {variables.map((variable) => (
          <Button
            key={variable.name}
            variant="outline"
            size="sm"
            onClick={() => insertVariable(variable.name)}
          >
            {variable.description}
          </Button>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">עריכה</TabsTrigger>
          <TabsTrigger value="preview">תצוגה מקדימה</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Card className="p-4">
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
