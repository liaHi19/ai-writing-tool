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
import { signUp, type SignUpState } from "@/actions/auth";
import {
  authDefaults,
  signUpSchema,
  type SignUpInput,
} from "@/lib/validation/auth";

export default function SignupForm() {
  const form = useForm<SignUpInput>({
    resolver: standardSchemaResolver(signUpSchema),
    defaultValues: authDefaults,
    mode: "onTouched",
  });
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(
    signUp,
    undefined,
  );

  useEffect(() => {
    if (state && "error" in state) toast.error(state.error);
  }, [state]);

  if (state && "emailSent" in state) {
    return (
      <div className="rounded-md border p-4 text-sm text-center space-y-1">
        <p className="font-medium">Check your email</p>
        <p className="text-muted-foreground">
          We sent a confirmation link to{" "}
          <span className="font-medium">{state.email}</span>.
        </p>
      </div>
    );
  }

  const onValid = (data: SignUpInput) => {
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
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
