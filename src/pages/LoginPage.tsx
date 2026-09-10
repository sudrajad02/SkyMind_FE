import { LoginForm } from "@/components/auth/LoginForm";
import { Layers, Sparkles, UsersRound, Zap } from "lucide-react";
import type React from "react";

export function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fa]">
      <div className="grid min-h-screen lg:grid-cols-[35%_65%]">
        {/* Left Side */}
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100" />

          {/* Decorative shapes */}
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-slate-200/50" />
          <div className="absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-slate-200/40" />

          <div className="relative z-10 flex w-full flex-col justify-center px-16 xl:px-24">
            <div className="mb-8">
              <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Sparkles className="h-10 w-10" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                ChatBotApp
              </h1>

              <p className="mt-4 max-w-sm text-base leading-6 text-slate-500">
                Smarter conversations
                <br />
                for a more productive you.
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <Feature
                icon={Zap}
                title="Get instant answers"
                description="on any topic"
              />

              <Feature
                icon={Layers}
                title="Boost your productivity"
                description="with AI"
              />

              <Feature
                icon={UsersRound}
                title="A more helpful"
                description="and personalized experience"
              />
            </div>
          </div>
        </section>

        {/* Right Side */}
        <section className="flex items-center justify-center bg-white px-6 py-12 lg:px-8">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}

type FeatureProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string
  description: string
}

function Feature({
  icon: Icon,
  title,
  description,
}: FeatureProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-7 w-7 items-cente justify-center text-xl text-slate-900">
        <Icon className="h-10 w-5 text-slate-900" />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">
          {title}
        </p>
        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}