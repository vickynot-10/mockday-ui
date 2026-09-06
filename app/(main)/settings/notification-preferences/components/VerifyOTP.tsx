"use client";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { AppButton } from "@/components/common/AppButton";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Check, ShieldCheck } from "lucide-react";
import { useVerifyEmailOtp } from "@/hooks/queries/useNotiications";

type VerifyOtpFormValues = {
  otp: string;
};

type VerifyOtpStepProps = {
  email: string;
  onBack: () => void;
  onVerified: (email: string) => void;
};

export default function VerifyOtpStep({
  email,
  onBack,
  onVerified,
}: VerifyOtpStepProps) {
  const { mutate: verifyOtp, isPending: verifyingOtp } = useVerifyEmailOtp();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyOtpFormValues>({
    defaultValues: { otp: "" },
  });

  const otpValue = watch("otp");

  function onSubmit(values: VerifyOtpFormValues) {
    verifyOtp(
      { email, otp: values.otp },
      {
        onSuccess: () => {
          onVerified(email);
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
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </span>
        <p className="text-sm font-medium mt-1">Check your inbox</p>
        <p className="text-xs text-muted-foreground">
          We sent a 6-digit code to {email}
        </p>
      </div>

      <div className="flex items-center justify-center gap-1.5 rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
        <p className="text-xs text-primary">
          OTP sent successfully &middot; valid for 10 mins
        </p>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <Controller
          control={control}
          name="otp"
          rules={{ validate: (v) => v?.length === 6 || "Enter the 6-digit code" }}
          render={({ field }) => (
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={field.value}
              onChange={field.onChange}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          )}
        />
        {errors.otp ? (
          <p className="text-xs text-destructive">{errors.otp.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Didn't get it? Check your spam folder.
          </p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <AppButton
          type="submit"
          isLoading={verifyingOtp}
          idleLabel="Verify"
          loadingLabel="Verifying..."
          successLabel="Verified"
          disabled={otpValue?.length !== 6}
        />
      </DialogFooter>
    </form>
  );
}