"use client";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { AppButton } from "@/components/common/AppButton";
import { useSendEmailOtp } from "@/hooks/queries/useNotiications";

type SendOtpFormValues = {
  custom_email: string;
};

type SendOtpStepProps = {
  onCancel: () => void;
  onSent: (email: string) => void;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SendOtpStep({ onCancel, onSent }: SendOtpStepProps) {
  const { mutate: sendOtp, isPending: sendingOtp } = useSendEmailOtp();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SendOtpFormValues>({
    defaultValues: { custom_email: "" },
  });

  const customEmail = watch("custom_email");

  function onSubmit(values: SendOtpFormValues) {
    sendOtp(
      { email: values.custom_email },
      {
        onSuccess: (res: any) => {
          if (res?.success) {
            onSent(values.custom_email);
          }
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4 pt-1"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="custom_email" className="text-sm">
          Email address
        </Label>
        <Input
          id="custom_email"
          type="email"
          placeholder="you@example.com"
          autoFocus
          aria-invalid={!!errors.custom_email}
          className={
            errors.custom_email
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
          {...register("custom_email", {
            required: "Enter an email address",
            pattern: {
              value: EMAIL_PATTERN,
              message: "Enter a valid email address",
            },
          })}
        />
        {errors.custom_email ? (
          <p className="text-xs text-destructive">
            {errors.custom_email.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            We'll send a 6-digit code to this address to confirm it's yours.
          </p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <AppButton
          type="submit"
          isLoading={sendingOtp}
          idleLabel="Send OTP"
          loadingLabel="Sending..."
          successLabel="Sent"
          disabled={!customEmail}
        />
      </DialogFooter>
    </form>
  );
}