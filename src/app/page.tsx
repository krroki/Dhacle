import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container-responsive py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            YouTube Shorts 마스터가 되는 가장 빠른 길
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            디하클과 함께 체계적인 교육으로 성공적인 크리에이터가 되세요
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/courses">강의 둘러보기</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses/free">무료 강의 시작</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">인기 강의</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="card-hover">
              <CardHeader>
                <CardTitle>YouTube Shorts 기초 과정 {i}</CardTitle>
                <CardDescription>초보자를 위한 완벽한 입문 강의</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  기초부터 실전까지 단계별로 학습하는 체계적인 커리큘럼
                </p>
                <Button className="w-full" variant="secondary">
                  자세히 보기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 bg-muted/50 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">
          지금 시작하세요!
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          10,000명 이상의 크리에이터가 디하클과 함께 성장하고 있습니다
        </p>
        <Button size="lg" className="gradient-primary">
          무료로 시작하기
        </Button>
      </section>
    </div>
  )
}