'use client';

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo,
  Save,
  Undo,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { Course } from '@/types';

interface CourseEditorProps {
  course?: Course;
  onSave: (courseData: Partial<Course>) => Promise<void>;
  isSaving?: boolean;
}

export function CourseEditor({ course, onSave, isSaving }: CourseEditorProps) {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    subtitle: course?.subtitle || '',
    description: course?.description || '',
    instructor_name: course?.instructor_name || '',
    price: course?.price || 0,
    is_free: course?.is_free || false,
    thumbnail_url: course?.thumbnail_url || '',
    previewVideoUrl: course?.previewVideoUrl || '',
    status: course?.status || ('upcoming' as 'upcoming' | 'active' | 'completed'),
    category: course?.category || '',
    difficulty: course?.difficulty || ('beginner' as 'beginner' | 'intermediate' | 'advanced'),
    language: course?.language || 'ko',
    requirements: course?.requirements || [],
    objectives: course?.objectives || [],
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        HTMLAttributes: {
          className: 'rounded-lg max-w-full',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          className: 'text-primary underline',
        },
      }),
    ],
    content: course?.contentBlocks
      ? typeof course.contentBlocks === 'string'
        ? course.contentBlocks
        : JSON.stringify(course.contentBlocks)
      : '',
    editorProps: {
      attributes: {
        className: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const content = editor?.getJSON();
    await onSave({
      ...formData,
      contentBlocks: JSON.stringify(content),
    });
  };

  const MenuBar = () => {
    if (!editor) {
      return null;
    }

    return (
      <div className="border rounded-lg p-2 flex flex-wrap gap-1 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Code className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt('URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
        >
          <Link2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt('이미지 URL:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">기본 정보</TabsTrigger>
          <TabsTrigger value="content">강의 내용</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">강의 제목 *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="예: YouTube Shorts 마스터 클래스"
                    required={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">부제목</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="예: 30일 만에 10만 구독자 달성하기"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">강의 설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="강의에 대한 간단한 설명을 작성하세요"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor_name">강사명 *</Label>
                  <Input
                    id="instructor_name"
                    name="instructor_name"
                    value={formData.instructor_name}
                    onChange={handleInputChange}
                    placeholder="예: 홍길동"
                    required={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="예: 콘텐츠 제작"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">가격 (원)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={formData.is_free}
                    min={0}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-8">
                  <Switch
                    id="isFree"
                    checked={formData.is_free}
                    onCheckedChange={handleSwitchChange('is_free')}
                  />
                  <Label htmlFor="isFree">무료 강의</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">썸네일 URL</Label>
                  <Input
                    id="thumbnail_url"
                    name="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previewVideoUrl">미리보기 비디오 URL</Label>
                  <Input
                    id="previewVideoUrl"
                    name="previewVideoUrl"
                    value={formData.previewVideoUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>강의 소개 컨텐츠</CardTitle>
            </CardHeader>
            <CardContent>
              <MenuBar />
              <div className="border rounded-lg">
                <EditorContent editor={editor} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>강의 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Select value={formData.status} onValueChange={handleSelectChange('status')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">준비중</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="completed">종료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>난이도</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={handleSelectChange('difficulty')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">초급</SelectItem>
                      <SelectItem value="intermediate">중급</SelectItem>
                      <SelectItem value="advanced">고급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>언어</Label>
                  <Select value={formData.language} onValueChange={handleSelectChange('language')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">영어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline">취소</Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              저장하기
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
