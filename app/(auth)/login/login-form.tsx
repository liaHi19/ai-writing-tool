"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signIn, type SignInState } from "@/actions/auth";
import {
  authDefaults,
  signInSchema,
  type SignInInput,
} from "@/lib/validation/auth";

export default function LoginForm() {
  const form = useForm<SignInInput>({
    resolver: standardSchemaResolver(signInSchema),
    defaultValues: authDefaults,
    mode: "onTouched",
  });

  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    undefined,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  const onValid = (data: SignInInput) => {
    const fd = new FormData();

    fd.set("email", data.email);
    fd.set("password", data.password);

    startTransition(() => formAction(fd));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValid)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
