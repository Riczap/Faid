create table if not exists expenses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) not null,
    concept text not null,
    amount numeric not null,
    category text not null,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table expenses enable row level security;

-- Create policies
create policy "Users can view their own expenses"
on expenses for select
using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
on expenses for insert
with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
on expenses for update
using (auth.uid() = user_id);

create policy "Users can delete their own expenses"
on expenses for delete
using (auth.uid() = user_id);
