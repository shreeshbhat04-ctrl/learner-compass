import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { companyRoadmaps, type CompanyRoadmap, type RoadmapStep } from "@/data/companyRoadmaps";
import { getCompanyTechAdvice } from "@/services/techviseService";

const RoadmapSteps = ({ steps }: { steps: RoadmapStep[] }) => (
  <div className="space-y-4">
    {steps.map((step, index) => (
      <Card key={`${step.phase}-${index}`} className="border border-border/60 bg-background/70 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">{step.phase}</h4>
          <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {step.duration}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{step.objective}</p>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {step.checklist.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    ))}
  </div>
);

const RoadmapsPage = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyRoadmaps[0]?.id ?? "");

  const selectedCompany = useMemo(
    () => companyRoadmaps.find((company) => company.id === selectedCompanyId) ?? companyRoadmaps[0],
    [selectedCompanyId],
  );

  const insiderAdvice = useMemo(
    () => getCompanyTechAdvice(selectedCompany.company, 4),
    [selectedCompany.company],
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-border/50 bg-gradient-card p-6"
        >
          <h1 className="text-3xl font-bold text-foreground">Company Roadmaps</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Separate curated tracks for internship and FTE roles, tailored per company.
          </p>
        </motion.div>

        <div className="mb-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {companyRoadmaps.map((company) => {
            const active = selectedCompany.id === company.id;
            return (
              <button
                key={company.id}
                type="button"
                onClick={() => setSelectedCompanyId(company.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  active
                    ? "border-primary/50 bg-primary/5 shadow-card"
                    : "border-border/60 bg-gradient-card hover:border-primary/30"
                }`}
                style={{
                  boxShadow: active ? `0 0 0 1px ${company.brandFrom}33 inset` : undefined,
                }}
              >
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-2 py-0.5 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {company.company}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{company.company}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{company.tagline}</p>
              </button>
            );
          })}
        </div>

        <motion.div
          key={selectedCompany.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-border/50 p-6"
          style={{
            background: `linear-gradient(135deg, ${selectedCompany.brandFrom}18, ${selectedCompany.brandTo}18)`,
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{selectedCompany.company}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{selectedCompany.tagline}</p>
            </div>
            <Button asChild variant="outline">
              <a href={selectedCompany.careersUrl} target="_blank" rel="noreferrer">
                Careers Portal
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Card className="border border-border/60 bg-background/70 p-4">
              <h3 className="text-sm font-semibold text-foreground">Core Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCompany.coreSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="border border-border/60 bg-background/70 p-4">
              <h3 className="text-sm font-semibold text-foreground">Hiring Signals</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {selectedCompany.hiringSignals.map((signal) => (
                  <li key={signal} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </motion.div>

        <div className="mb-10">
          <Tabs defaultValue="internship">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="internship">Internship Roadmap</TabsTrigger>
              <TabsTrigger value="fte">FTE Roadmap</TabsTrigger>
            </TabsList>

            <TabsContent value="internship" className="mt-4">
              <RoadmapSteps steps={selectedCompany.internshipRoadmap} />
            </TabsContent>
            <TabsContent value="fte" className="mt-4">
              <RoadmapSteps steps={selectedCompany.fteRoadmap} />
            </TabsContent>
          </Tabs>
        </div>

        <Card className="border border-border/50 bg-gradient-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Insider Advice From {selectedCompany.company} Engineers
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to={`/techvise?company=${encodeURIComponent(selectedCompany.company)}`}>
                Ask On TechVise
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {insiderAdvice.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No insider advice yet. Start the first discussion in TechVise for this company.
            </p>
          )}

          <div className="space-y-3">
            {insiderAdvice.map((answer) => (
              <Card key={answer.id} className="border border-border/60 bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">{answer.body}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {answer.author.name}
                    {answer.author.role ? ` • ${answer.author.role}` : ""}
                  </span>
                  <span>
                    Helpful votes: {answer.upvotes - answer.downvotes} ({answer.upvotes}↑ /{" "}
                    {answer.downvotes}↓)
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoadmapsPage;
