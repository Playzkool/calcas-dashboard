from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0002_alter_pupil_grade'),
    ]

    operations = [
        migrations.AddField(
            model_name='registrationfile',
            name='document',
            field=models.FileField(blank=True, null=True, upload_to='registration_documents/', verbose_name='Document'),
        ),
    ]