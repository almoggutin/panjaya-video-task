"""use timestamptz for all datetime columns

Revision ID: c2f4e8b1a6d3
Revises: b7e3d12a4f89
Create Date: 2026-04-28

"""

from typing import Union

import sqlalchemy as sa
from alembic import op

revision: str = "c2f4e8b1a6d3"
down_revision: Union[str, None] = "b7e3d12a4f89"
branch_labels = None
depends_on = None

_TIMESTAMPTZ = sa.DateTime(timezone=True)
_TIMESTAMP = sa.DateTime(timezone=False)


def upgrade() -> None:
    op.alter_column(
        "users",
        "created_at",
        type_=_TIMESTAMPTZ,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "users",
        "updated_at",
        type_=_TIMESTAMPTZ,
        postgresql_using="updated_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "assets",
        "created_at",
        type_=_TIMESTAMPTZ,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "assets",
        "updated_at",
        type_=_TIMESTAMPTZ,
        postgresql_using="updated_at AT TIME ZONE 'UTC'",
    )

    op.alter_column(
        "refresh_tokens",
        "expires_at",
        type_=_TIMESTAMPTZ,
        postgresql_using="expires_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "refresh_tokens",
        "created_at",
        type_=_TIMESTAMPTZ,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )


def downgrade() -> None:
    op.alter_column("users", "created_at", type_=_TIMESTAMP)
    op.alter_column("users", "updated_at", type_=_TIMESTAMP)

    op.alter_column("assets", "created_at", type_=_TIMESTAMP)
    op.alter_column("assets", "updated_at", type_=_TIMESTAMP)

    op.alter_column("refresh_tokens", "expires_at", type_=_TIMESTAMP)
    op.alter_column("refresh_tokens", "created_at", type_=_TIMESTAMP)
