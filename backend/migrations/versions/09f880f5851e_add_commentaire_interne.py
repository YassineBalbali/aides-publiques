"""add commentaire_interne

Revision ID: 09f880f5851e
Revises: 2c31a64765ae
Create Date: 2026-04-16 11:56:10.754958

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '09f880f5851e'
down_revision: Union[str, Sequence[str], None] = '2c31a64765ae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ajouter uniquement le champ commentaire_interne
    op.add_column('dossiers', sa.Column('commentaire_interne', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('dossiers', 'commentaire_interne')