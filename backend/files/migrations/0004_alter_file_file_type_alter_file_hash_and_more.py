# Generated by Django 5.2 on 2025-04-24 14:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('files', '0003_alter_file_hash_file_unique_hash_for_non_reference'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='file_type',
            field=models.CharField(db_index=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='file',
            name='hash',
            field=models.CharField(db_index=True, max_length=64),
        ),
        migrations.AlterField(
            model_name='file',
            name='is_reference',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AlterField(
            model_name='file',
            name='original_filename',
            field=models.CharField(db_index=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='file',
            name='reference_count',
            field=models.PositiveIntegerField(db_index=True, default=1),
        ),
        migrations.AlterField(
            model_name='file',
            name='size',
            field=models.BigIntegerField(db_index=True),
        ),
        migrations.AlterField(
            model_name='file',
            name='uploaded_at',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AddIndex(
            model_name='file',
            index=models.Index(fields=['file_type', 'size'], name='files_file_file_ty_421fd5_idx'),
        ),
        migrations.AddIndex(
            model_name='file',
            index=models.Index(fields=['uploaded_at', 'file_type'], name='files_file_uploade_dce3a8_idx'),
        ),
        migrations.AddIndex(
            model_name='file',
            index=models.Index(fields=['reference_count', 'is_reference'], name='files_file_referen_803b0f_idx'),
        ),
    ]
