from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0004_alter_emailotp_id_alter_emergencycontact_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='emergencycontact',
            name='email',
            field=models.EmailField(blank=True, null=True),
        ),
    ]
