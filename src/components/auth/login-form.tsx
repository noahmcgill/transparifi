"use client";

import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { continueWithGithub } from "@/lib/utils/actions";
import { useEffect } from "react";
import { toast } from "sonner";
import { ContinueWithMagicLinkBtn } from "./continue-with-magic-link-btn";
import Link from "next/link";
import { ClaimLinkStep } from "../ui/claim-link/types";

interface LoginFormProps {
  slug?: string;
  setCurrentStep?: (step: ClaimLinkStep) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  slug,
  setCurrentStep,
}) => {
  const searchParams = useSearchParams();

  const getErrorMsg = (error: string): string => {
    switch (error) {
      case "Configuration":
        return "This sign in method has not been properly configured. Please contact the site admin.";
      case "AccessDenied":
        return "Your sign in credentials are invalid. Please try again.";
      case "Verification":
        return "There's a problem with your login token. Please try again.";
      case "OAuthAccountNotLinked":
        return "The email address linked to this GitHub account has already been used via another sign in provider.";
      case "Default":
      default:
        return "An unexpected error occured. Please try again.";
    }
  };

  useEffect(() => {
    const error = searchParams.get("error");
    const status = searchParams.get("status");

    if (error && error !== "") {
      const message = getErrorMsg(error);
      toast.error(message);
    } else if (status && status === "sent") {
      toast.success("Please check your email for a login link.");
    }
  }, [searchParams]);

  return (
    <div className={"flex flex-col gap-6"}>
      <form>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-medium">
              {!slug ? "Login to transparify" : "One last step!"}
            </h1>
            <div className="text-center text-sm">
              {!slug
                ? "It's good to have you back!"
                : `Create an account to claim your link at /${slug}.`}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="me@example.com"
              />
            </div>
            <ContinueWithMagicLinkBtn />
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              or
            </span>
          </div>
          <div className="flex">
            <Button
              variant="outline"
              className="w-full"
              formAction={continueWithGithub}
            >
              <FaGithub />
              Continue with GitHub
            </Button>
            <input type="hidden" name="slug" value={slug} />
          </div>
        </div>
      </form>
      <p className="text-center text-sm text-zinc-500">
        {slug && (
          <Button
            variant="link"
            className="self-start p-0 font-normal text-zinc-500"
            onClick={() => setCurrentStep?.(ClaimLinkStep.CHECK_LINK)}
          >
            go back
          </Button>
        )}
        {" or "}
        <Button
          asChild
          variant="link"
          className="p-0 font-normal text-zinc-500"
        >
          {!slug ? (
            <Link href="/signup">sign up</Link>
          ) : (
            <Link href="/login">login</Link>
          )}
        </Button>
      </p>
    </div>
  );
};
