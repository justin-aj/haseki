"use client";

import { RulerIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sizeChart, toInches } from "@/lib/size-guide";

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4">
        <RulerIcon className="size-4" strokeWidth={1.5} />
        Size guide
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto bg-background sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Size guide</DialogTitle>
          <DialogDescription>
            Body measurements, not garment measurements. Match your largest measurement, then check the fit notes
            for each piece.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="cm">
          <TabsList>
            <TabsTrigger value="cm">cm</TabsTrigger>
            <TabsTrigger value="in">inches</TabsTrigger>
          </TabsList>
          {(["cm", "in"] as const).map((unit) => (
            <TabsContent key={unit} value={unit}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm tabular-nums">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2.5 pr-3 font-normal">Size</th>
                      <th className="py-2.5 pr-3 font-normal">Bust</th>
                      <th className="py-2.5 pr-3 font-normal">Waist</th>
                      <th className="py-2.5 pr-3 font-normal">Hip</th>
                      <th className="py-2.5 pr-3 font-normal">UK</th>
                      <th className="py-2.5 font-normal">US</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.map((r) => (
                      <tr key={r.size} className="border-b last:border-0">
                        <td className="py-2.5 pr-3 font-medium">{r.size}</td>
                        {[r.bust, r.waist, r.hip].map((v, i) => (
                          <td key={i} className="py-2.5 pr-3">
                            {unit === "cm" ? v : toInches(v)}
                          </td>
                        ))}
                        <td className="py-2.5 pr-3">{r.uk}</td>
                        <td className="py-2.5">{r.us}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <div className="space-y-2 rounded-sm bg-secondary p-4 text-sm">
          <p className="font-medium">How to measure</p>
          <p className="text-muted-foreground">
            <strong className="font-medium text-foreground">Bust:</strong> around the fullest part, tape level.{" "}
            <strong className="font-medium text-foreground">Waist:</strong> at the narrowest point.{" "}
            <strong className="font-medium text-foreground">Hip:</strong> around the fullest part of your hips.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
