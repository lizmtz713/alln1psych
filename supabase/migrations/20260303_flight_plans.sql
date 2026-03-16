-- Flight Plan — Family Edition (cognitive offloading: micro-tasks for Direction)
-- Pilot requests; Ground Control adds 3–5 steps; Pilot checks off.

CREATE TABLE IF NOT EXISTS public.flight_plan_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fleet_id UUID REFERENCES public.fleet_groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'steps_added', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.flight_plan_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.flight_plan_requests(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_flight_plan_requests_pilot ON public.flight_plan_requests(pilot_id);
CREATE INDEX IF NOT EXISTS idx_flight_plan_requests_fleet ON public.flight_plan_requests(fleet_id);
CREATE INDEX IF NOT EXISTS idx_flight_plan_requests_created ON public.flight_plan_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flight_plan_steps_request ON public.flight_plan_steps(request_id);

ALTER TABLE public.flight_plan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_plan_steps ENABLE ROW LEVEL SECURITY;

-- Pilot can insert own request
CREATE POLICY "Users can insert own flight plan request"
  ON public.flight_plan_requests FOR INSERT
  WITH CHECK (auth.uid() = pilot_id);

-- Fleet can view requests (pilots in same fleet)
CREATE POLICY "Users can view fleet flight plan requests"
  ON public.flight_plan_requests FOR SELECT
  USING (
    pilot_id IN (
      SELECT user_id FROM public.fleet_members fm
      WHERE fm.fleet_id IN (
        SELECT fleet_id FROM public.fleet_members WHERE user_id = auth.uid()
      )
    )
  );

-- Fleet members can update request status (e.g. when steps added)
CREATE POLICY "Fleet can update flight plan requests"
  ON public.flight_plan_requests FOR UPDATE
  USING (
    pilot_id IN (
      SELECT user_id FROM public.fleet_members fm
      WHERE fm.fleet_id IN (
        SELECT fleet_id FROM public.fleet_members WHERE user_id = auth.uid()
      )
    )
  );

-- Fleet can insert steps for requests in their fleet
CREATE POLICY "Fleet can insert flight plan steps"
  ON public.flight_plan_steps FOR INSERT
  WITH CHECK (
    request_id IN (
      SELECT id FROM public.flight_plan_requests
      WHERE pilot_id IN (
        SELECT user_id FROM public.fleet_members fm
        WHERE fm.fleet_id IN (
          SELECT fleet_id FROM public.fleet_members WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Fleet can view steps for requests in their fleet
CREATE POLICY "Fleet can view flight plan steps"
  ON public.flight_plan_steps FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM public.flight_plan_requests
      WHERE pilot_id IN (
        SELECT user_id FROM public.fleet_members fm
        WHERE fm.fleet_id IN (
          SELECT fleet_id FROM public.fleet_members WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Pilot (owner of request) can update step completed_at
CREATE POLICY "Pilot can update own request steps completed"
  ON public.flight_plan_steps FOR UPDATE
  USING (
    request_id IN (
      SELECT id FROM public.flight_plan_requests WHERE pilot_id = auth.uid()
    )
  );

-- Fleet can update steps (e.g. Ground Control editing step text)
CREATE POLICY "Fleet can update flight plan steps"
  ON public.flight_plan_steps FOR UPDATE
  USING (
    request_id IN (
      SELECT id FROM public.flight_plan_requests
      WHERE pilot_id IN (
        SELECT user_id FROM public.fleet_members fm
        WHERE fm.fleet_id IN (
          SELECT fleet_id FROM public.fleet_members WHERE user_id = auth.uid()
        )
      )
    )
  );
