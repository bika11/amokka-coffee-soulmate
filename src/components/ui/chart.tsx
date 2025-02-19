
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

type ChartProps = React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ResponsiveContainer>;

const Chart = React.forwardRef<React.ElementRef<typeof RechartsPrimitive.ResponsiveContainer>, ChartProps>(
  ({ children, ...props }, ref) => (
    <RechartsPrimitive.ResponsiveContainer {...props}>
      {children}
    </RechartsPrimitive.ResponsiveContainer>
  )
);
Chart.displayName = "Chart";

interface ChartBarStackedProps extends React.ComponentPropsWithoutRef<typeof RechartsPrimitive.BarChart> {
  data: any[];
}

const ChartBarStacked = React.forwardRef<React.ElementRef<typeof RechartsPrimitive.BarChart>, ChartBarStackedProps>(
  ({ className, data, ...props }, ref) => {
    const memoizedData = React.useMemo(() => data, [data]);

    return (
      <RechartsPrimitive.BarChart
        ref={ref}
        data={memoizedData}
        className={cn("", className)}
        {...props}
      >
        <RechartsPrimitive.XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <RechartsPrimitive.YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <RechartsPrimitive.Tooltip />
        {props.children}
      </RechartsPrimitive.BarChart>
    );
  }
);
ChartBarStacked.displayName = "ChartBarStacked";

// Updated Bar component with correct typing
const ChartBar = ({ ...props }: React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Bar>) => (
  <RechartsPrimitive.Bar {...props} />
);
ChartBar.displayName = "ChartBar";

// Updated Line component with correct typing
const ChartLine = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Line>) => (
  <RechartsPrimitive.Line
    className={cn("", className)}
    {...props}
  />
);
ChartLine.displayName = "ChartLine";

// Updated Area component with correct typing
const ChartArea = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Area>) => (
  <RechartsPrimitive.Area
    className={cn("", className)}
    {...props}
  />
);
ChartArea.displayName = "ChartArea";

interface ChartLegendItemProps {
  className?: string;
  indicator?: "dot" | "line" | "dashed";
  itemConfig?: {
    icon?: React.ComponentType;
  };
  hideIndicator?: boolean;
  indicatorColor?: string;
  nestLabel?: boolean;
  children?: React.ReactNode;
}

const ChartLegendItem = React.forwardRef<HTMLDivElement, ChartLegendItemProps>(
  ({ className, indicator = "dot", itemConfig, hideIndicator, indicatorColor, nestLabel, children }, ref) => {
    const indicatorStyle = React.useMemo(
      () => ({
        "--color-bg": indicatorColor,
        "--color-border": indicatorColor,
      } as React.CSSProperties),
      [indicatorColor]
    );

    const indicatorClassName = React.useMemo(
      () => cn(
        "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
        indicator === "dot" && "h-2.5 w-2.5",
        indicator === "line" && "w-1",
        indicator === "dashed" && "w-0 border-[1.5px] border-dashed bg-transparent",
        nestLabel && indicator === "dashed" && "my-0.5"
      ),
      [indicator, nestLabel]
    );

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center gap-2", className)}
      >
        {itemConfig?.icon ? (
          <itemConfig.icon />
        ) : (
          !hideIndicator && (
            <div
              className={indicatorClassName}
              style={indicatorStyle}
            />
          )
        )}
        <span>{children}</span>
      </div>
    );
  }
);
ChartLegendItem.displayName = "ChartLegendItem";

export {
  Chart,
  ChartBarStacked,
  ChartBar,
  ChartLine,
  ChartArea,
  ChartLegendItem,
};
