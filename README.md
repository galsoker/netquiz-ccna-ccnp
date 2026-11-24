# נטקוויז – NetQuiz (CCNA / CCNP)

משחק שאלות אמריקאיות לאנדרואיד לתרגול CCNA ו־CCNP, בעברית ומימין לשמאל.

- 506 שאלות (294 CCNA, ‏212 CCNP), כל שאלה עם הסבר לתשובה הנכונה
- מסלולים: CCNA, ‏CCNP או מעורב · ניקוד, רצפים, בונוסים · חיזוק נקודות חולשה
- ליגת חברים בעזרת קודי הזמנה
- **עובד בלי אינטרנט** – כל המשחק נמצא בתוך ה־APK, והאפליקציה לא מבקשת הרשאת אינטרנט

## הורדה
את ה־APK העדכני מורידים מעמוד ה־Releases:
`releases/latest/download/NetQuiz.apk`

## בנייה
כל push ל־`main` בונה APK חתום ב־GitHub Actions, ומפרסם אותו כ־Release.
בנייה מקומית: Android Studio, או `gradle :app:assembleRelease` (‏JDK 17, ‏Android SDK 34).

> מפתח החתימה (`app/netquiz-release.jks`) שמור בריפו כדי שכל גרסה תתעדכן מעל הקודמת.
> בפרויקט מסחרי מעבירים אותו ל־GitHub Secrets.
