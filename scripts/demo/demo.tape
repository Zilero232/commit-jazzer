# The README demo. Render from the repository root after `bun run build`:
#   mise x vhs ttyd -- vhs scripts/demo/demo.tape
Output site/public/demo.gif

Set Shell "bash"
Set FontSize 18
Set Width 1100
Set Height 640
Set Padding 24
Set Theme "Catppuccin Mocha"
Set TypingSpeed 55ms
Set CursorBlink false

Hide
Type "export JAZZER=$PWD/dist/cli.mjs && cd $(mktemp -d) && git init -q -b feat/42-passkeys && git config user.name Demo && git config user.email demo@example.com" Enter
Type `echo '{ "scopes": ["api", "auth", "web"] }' > jazzer.config.json && echo 'export {}' > login.ts && git add . && jazzer() { node $JAZZER "$@"; } && PS1='\[\e[35m\]❯\[\e[0m\] ' && clear` Enter
Show

Sleep 500ms
Type "jazzer" Sleep 300ms Enter
Sleep 1.2s
Type "fea" Sleep 900ms Enter
Sleep 600ms
Type "au" Sleep 700ms Enter
Sleep 500ms
Type "add login with passkeys" Sleep 500ms Enter
Sleep 400ms
Type "Passkeys replace passwords for new accounts." Sleep 500ms Enter
Sleep 400ms
Enter
Sleep 800ms
Enter
Sleep 2s
Enter
Sleep 4s
