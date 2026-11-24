package com.netquiz.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * NetQuiz – the whole game ships inside the APK (assets/) and is rendered by an
 * embedded view. No browser is opened and no internet connection is needed.
 */
public class MainActivity extends Activity {

    private WebView view;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        view = new WebView(this);
        view.setOverScrollMode(View.OVER_SCROLL_NEVER);
        view.setVerticalScrollBarEnabled(false);

        WebSettings s = view.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // scores, friends and progress are saved on the device
        s.setAllowFileAccess(true);            // load the bundled game files
        s.setAllowContentAccess(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " NetQuizApp");

        view.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                return handle(request.getUrl().toString());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                return handle(url);
            }
        });

        setContentView(view);
        if (savedInstanceState != null) {
            view.restoreState(savedInstanceState);
        } else {
            view.loadUrl("file:///android_asset/index.html");
        }
    }

    /** Messages from the game: share an invite / exit. Everything else stays inside the app. */
    private boolean handle(String url) {
        if (url.startsWith("app-share:")) {
            String text = Uri.decode(url.substring("app-share:".length()));
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_TEXT, text);
            try {
                startActivity(Intent.createChooser(send, getString(R.string.share_title)));
            } catch (ActivityNotFoundException ignored) { }
            return true;
        }
        if (url.startsWith("app-exit:")) {
            finish();
            return true;
        }
        // never leave the app for external pages
        return !url.startsWith("file:///android_asset/");
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (view != null) view.saveState(outState);
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (view != null) {
            view.evaluateJavascript("window.appBack && appBack()", null);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (view != null) {
            view.destroy();
            view = null;
        }
        super.onDestroy();
    }
}
