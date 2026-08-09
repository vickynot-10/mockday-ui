"use client"
import { useState } from "react";
import { motion, Variants } from "motion/react";
import { useForm } from "react-hook-form";
import { ImageIcon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SignUpFormValues } from "@/types/auth.types";

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.4, ease: "easeOut" as const },
  }),
};
export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>();
  const [agreed, setAgreed] = useState<boolean>(false);

  const onSubmit = (data: SignUpFormValues) => {
    console.log(data);
  };

  const handleCheckedChange = (value: boolean) => {
    setAgreed(value === true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 p-6">
      <div className="w-full max-w-5xl rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col justify-center px-8 py-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg border-2 border-dashed border-blue-500"
            >
              <ImageIcon
                className="h-4 w-4 text-neutral-900"
                strokeWidth={2.5}
              />
            </motion.div>

            <motion.h1
              variants={fieldVariants}
              custom={0}
              initial="hidden"
              animate="visible"
              className="text-3xl font-bold text-neutral-900"
            >
              Create an account
            </motion.h1>

            <motion.p
              variants={fieldVariants}
              custom={1}
              initial="hidden"
              animate="visible"
              className="mt-2 text-sm text-neutral-500"
            >
              Let's get started. Fill in the details below to create your
              account.
            </motion.p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <motion.div
                variants={fieldVariants}
                custom={2}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-neutral-900"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Name"
                  {...register("name", { required: true })}
                />
              </motion.div>

              <motion.div
                variants={fieldVariants}
                custom={3}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-neutral-900"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  {...register("email", { required: true })}
                />
              </motion.div>

              <motion.div
                variants={fieldVariants}
                custom={4}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-neutral-900"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  {...register("password", { required: true, minLength: 8 })}
                />
                <p className="text-xs text-neutral-500">
                  Minimum 8 characters.
                </p>
              </motion.div>

              <motion.div
                variants={fieldVariants}
                custom={5}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-2"
              >
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={handleCheckedChange}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-neutral-600 font-normal"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="font-medium text-neutral-900 underline"
                  >
                    Terms &amp; Conditions
                  </a>
                </Label>
              </motion.div>

              <motion.div
                variants={fieldVariants}
                custom={6}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-neutral-900 py-6 text-sm font-semibold text-white hover:bg-neutral-800"
                  >
                    Sign up
                  </Button>
                </motion.div>
              </motion.div>

              <motion.p
                variants={fieldVariants}
                custom={7}
                initial="hidden"
                animate="visible"
                className="text-center text-sm text-neutral-500"
              >
                Already have account?{" "}
                <a href="#" className="font-medium text-neutral-900 underline">
                  Sign in
                </a>
              </motion.p>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative hidden md:flex items-center justify-center rounded-2xl bg-neutral-200 overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-64 rounded-full border border-neutral-300/70" />
              <div className="absolute h-64 w-64 rotate-45 border border-neutral-300/70 rounded-full" />
            </div>
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100">
              <ImageIcon className="h-6 w-6 text-neutral-400" />
            </div>
            <button className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
              <Palette className="h-4 w-4 text-neutral-700" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
