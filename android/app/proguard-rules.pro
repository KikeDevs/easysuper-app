# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Mantener anotaciones (Capacitor lee @Permission por reflection)
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Mantener Capacitor core y anotaciones
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.annotation.** { *; }

# Mantener plugins (Geolocation + Google Maps)
-keep class com.capacitorjs.plugins.geolocation.** { *; }
-keep class com.capacitorjs.plugins.googlemaps.** { *; }

# Mantener tus plugins/terceros (social login)
-keep class ee.forgr.capacitor.social.login.** { *; }

# Evita warnings que a veces rompen el build
-dontwarn com.getcapacitor.**
-dontwarn com.capacitorjs.plugins.**
-dontwarn ee.forgr.capacitor.social.login.**
-keep class ee.forgr.capacitor.social.login.** { *; }
-dontwarn ee.forgr.capacitor.social.login.**
-dontwarn com.google.android.gms.**