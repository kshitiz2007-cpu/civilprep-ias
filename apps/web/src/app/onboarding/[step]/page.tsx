import { ZenithOnboarding } from "@/components/zenith-onboarding";

export const metadata = {
  title: "Set up your learning space | CivilPrep IAS",
  description: "Calibrate your CivilPrep learning sanctuary.",
};

export default async function OnboardingStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const parsedStep = Number.parseInt(step, 10);
  return <ZenithOnboarding initialStep={Number.isFinite(parsedStep) ? parsedStep : 1} />;
}
