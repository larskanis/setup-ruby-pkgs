/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 110:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "run": () => (/* binding */ run)
/* harmony export */ });


const core = __nccwpck_require__(948)

const { execSync, grpSt, grpEnd } = __nccwpck_require__(734)

// group start time
let msSt

// clean inputs
let apt = core.getInput('apt-get').replace(/[^a-z_ \d.-]+/gi, '').trim().toLowerCase()

const run = async () => {
  try {
    if (apt !== '') {

      // fix for server timeout issues
/*      msSt = grpSt('apt-get server fix')
 *      apt += ' _update_'
 *      execSync(`sudo sed -i 's/azure\\.//' /etc/apt/sources.list`)
 *      grpEnd(msSt)
 */

      const opts = '-o Acquire::Retries=3'
      let needUpdate  = true
      let needUpgrade = true

//      if (/\b_update_\b/.test(apt)) {
        msSt = grpSt('apt-get update')
        execSync(`sudo apt-get ${opts} -qy update`)
        grpEnd(msSt)
        apt = apt.replace(/\b_update_\b/gi, '').trim()
        needUpdate = false
//      }

      if (/\b_dist-upgrade_\b/.test(apt)) {
        msSt = grpSt('apt-get dist-upgrade')
        if (needUpdate) { execSync('sudo apt-get -qy update') }
        execSync(`sudo apt-get ${opts} -qy dist-upgrade`)
        grpEnd(msSt)
        needUpgrade = false
        apt = apt.replace(/\b_dist-upgrade_\b/gi, '').trim()
      }
      
      if (/\b_upgrade_\b/.test(apt)) {
        if (needUpgrade) {
          msSt = grpSt('apt-get upgrade')
          if (needUpdate) { execSync(`sudo apt-get ${opts} -qy update`) }
          execSync(`sudo apt-get ${opts} -qy upgrade`)
        grpEnd(msSt)
        }
        apt = apt.replace(/\b_upgrade_\b/gi, '').trim()
      }

      if (apt !== '') {
        msSt = grpSt(`apt-get ${apt}`)
        execSync(`sudo apt-get ${opts} -qy --no-install-recommends install ${apt}`)
        grpEnd(msSt)
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}


/***/ }),

/***/ 310:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "run": () => (/* binding */ run)
/* harmony export */ });


const core = __nccwpck_require__(948)

const { execSync, grpSt, grpEnd } = __nccwpck_require__(734)

// group start time
let msSt

// clean inputs
let brew = core.getInput('brew').replace(/[^a-z_ \d.@-]+/gi, '').trim().toLowerCase()

const run = async () => {
  try {
    if (brew !== '') {
      let needUpdate = true

      if (/\b_update_\b/.test(brew)) {
        msSt = grpSt('brew update')
        execSync('brew update')
        grpEnd(msSt)
        needUpdate = false
        brew = brew.replace(/\b_update_\b/gi, '').trim()
      }

      if (/\b_upgrade_\b/.test(brew)) {
        msSt = grpSt('brew upgrade')
        if (needUpdate) { execSync('brew update') }
        execSync('brew upgrade')
        grpEnd(msSt)
        brew = brew.replace(/\b_upgrade_\b/gi, '').trim()
      }

      if (brew !== '') {
        msSt = grpSt(`brew install ${brew}`)
          execSync(`brew install ${brew}`)
        grpEnd(msSt)
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}


/***/ }),

/***/ 734:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "version": () => (/* binding */ version),
/* harmony export */   "download": () => (/* binding */ download),
/* harmony export */   "ruby": () => (/* binding */ ruby),
/* harmony export */   "execSync": () => (/* binding */ execSync),
/* harmony export */   "execSyncQ": () => (/* binding */ execSyncQ),
/* harmony export */   "grpSt": () => (/* binding */ grpSt),
/* harmony export */   "grpEnd": () => (/* binding */ grpEnd),
/* harmony export */   "log": () => (/* binding */ log),
/* harmony export */   "getInput": () => (/* binding */ getInput),
/* harmony export */   "win2nix": () => (/* binding */ win2nix),
/* harmony export */   "updateKeyRing": () => (/* binding */ updateKeyRing)
/* harmony export */ });


const cp = __nccwpck_require__(129)
const fs = __nccwpck_require__(747)
const path  = __nccwpck_require__(622)
const core  = __nccwpck_require__(948)
const httpc = __nccwpck_require__(666)

const { performance } = __nccwpck_require__(630)

const colors = {
  'yel': '\x1b[93m',
  'blu': '\x1b[94m'
}
const rst = '\x1b[0m'

const version = JSON.parse(fs.readFileSync(__nccwpck_require__.ab + "package.json", 'utf8')).version

const download = async (uri, dest, log = true) => {
  // make sure the folder exists
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
  }

  if (log) { console.log(`[command]Downloading:\n  ${uri}`) }

  const http = new httpc.HttpClient('MSP-Greg', [], {
    allowRetries: true,
    maxRetries: 3
  })

  const msg = (await http.get(uri)).message

  return new Promise ( (resolve, reject) => {
    if (msg.statusCode !== 200) {
      const errMsg = `Failed to download from:\n  ${uri}\n` +
                     `  StatusCode: ${msg.statusCode}  Message: ${msg.statusMessage}`
      reject(new Error(errMsg))
    }

    const file = fs.createWriteStream(dest)

    file.on('open', async () => {
      try {
        const stream = msg.pipe(file)
        stream.on('close', () => {
          resolve(dest)
        })
      } catch (err) {
        const errMsg = `Failed to download from:\n  ${uri}\n` +
                       `  StatusCode: ${msg.statusCode}  Message: ${msg.statusMessage}\n  Error: ${err.message}`
        reject(new Error(errMsg))
      }
    })
    file.on('error', err => {
      file.end()
      reject(err)
    })
  })
}

// get Ruby info in one pass
const ruby = () => {
  let map = {}
  let ary = ['platform', 'engine', 'engineVersion', 'vers', 'abiVers' ]
  let cmd = 'ruby -e "puts RUBY_PLATFORM, RUBY_ENGINE, (Object.const_defined?(:RUBY_ENGINE_VERSION) ? RUBY_ENGINE_VERSION : nil), RUBY_VERSION, RbConfig::CONFIG[%q[ruby_version]]"';
  cp.execSync(cmd).toString().trim().split(/\r?\n/).forEach( (v,i) => {
    map[ary[i]]  = v
  })
  return map
}

const execSync = (cmd) => {
  console.log(`[command]${cmd}`)
  cp.execSync(cmd, {stdio: ['ignore', 'inherit', 'inherit']})
}

const execSyncQ = (cmd) => {
  console.log(`[command]${cmd}`)
  cp.execSync(cmd, {stdio: ['ignore', 'ignore', 'inherit']})
  console.log('  Done')
}

const grpSt = (desc) => {
  console.log(`##[group]${colors['yel']}${desc}${rst}`)
  return performance.now()
}

const grpEnd = (msSt) => {
  const timeStr = ((performance.now() - msSt)/1000).toFixed(2).padStart(6)
  console.log(`::[endgroup]\n  took ${timeStr} s`)
}

const log = (logText, color = 'yel') => {
  console.log(`${colors[color]}${logText}${rst}`)
}

const getInput = (name) => core.getInput(name).replace(/[^a-z_ \d.-]+/gi, '').trim().toLowerCase()

// convert windows path like C:\Users\runneradmin to /c/Users/runneradmin
const win2nix = (path) => {
  return (/^[A-Z]:/i.test(path) ?
    ('/' + path[0].toLowerCase() + path.split(':',2)[1]) :
    path).replace(/\\/g, '/').replace(/ /g, '\\ ')
}

const updateKeyRing = async (vers) => {
  const dlPath = `${process.env.RUNNER_TEMP}\\srp`
  const uri = `https://repo.msys2.org/msys/x86_64/msys2-keyring-${vers}-any.pkg.tar.zst`
  const fn = `${dlPath}\\key-ring.tar.xz`
  const msSt = grpSt('install updated MSYS2 keyring')

  await download(uri, fn)
  await download(`${uri}.sig`, `${fn}.sig`)

  const origPath = process.env.Path
  process.env.Path = `C:\\msys64\\usr\\bin;C:\\msys64\\mingw64\\bin;${origPath}`

  execSync(`C:\\msys64\\usr\\bin\\pacman.exe -Udd --noconfirm --noprogressbar ${fn}`)
  process.env['Path'] = origPath

  grpEnd(msSt)
}


/***/ }),

/***/ 31:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "setRuby": () => (/* binding */ setRuby),
/* harmony export */   "run": () => (/* binding */ run)
/* harmony export */ });


const fs   = __nccwpck_require__(747)
const core = __nccwpck_require__(948)

// , updateKeyRing
const { download, execSync, execSyncQ, grpSt, grpEnd, getInput, win2nix } = __nccwpck_require__(734)

// group start time
let msSt

// used to only update MSYS2 database (y parameter) once
let msys2Sync = '-Sy'

// SSD drive, used for most downloads and MSYS
const drive = (process.env.GITHUB_WORKSPACE || 'C')[0]

// location to extract old MSYS packages
const dirDK7z  = `${drive}:\\DevKit64\\mingw\\x86_64-w64-mingw32`

const dlPath = `${process.env.RUNNER_TEMP}\\srp`
if (!fs.existsSync(dlPath)) {
  fs.mkdirSync(dlPath, { recursive: true })
}

let ruby
let old_pkgs
let RELEASE_ASSET

// clean inputs
let mingw = getInput('mingw')
let msys2 = getInput('msys2')

let pre // set in setRuby, ' mingw-w64-x86_64-' or ' mingw-w64-i686-'
// standard pacman args
const args  = '--noconfirm --noprogressbar --needed'

// Not used. Installs packages stored in GitHub release.
// Only needed for exceptional cases.
const install = async (pkg, release) => {  // eslint-disable-line no-unused-vars
  const uriBase = 'https://github.com/MSP-Greg/ruby-msys2-package-archive/releases/download'
  const suff    = '-any.pkg.tar.xz'
  const args    = '--noconfirm --noprogressbar --needed'

  const uri = `${uriBase}/${release}`

  const dir = `${dlPath}\\msys2_gcc`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  let f = `${pre}${pkg}${suff}`
  await download(`${uri}/${f}`    , `${dir}\\${f}`)
  await download(`${uri}/${f}.sig`, `${dir}\\${f}.sig`)
  console.log(`pacman.exe -Udd ${args} ${dir}\\${f}`)

  const cwd = process.cwd()
  try {
    process.chdir(dir)
    execSync(`pacman.exe -Udd ${args} ${f}`)
    process.chdir(cwd)
  } catch (error) {
    process.chdir(cwd)
    core.setFailed(error.message)
  }
}

/* Renames OpenSSL dlls in System32 folder, installs OpenSSL 1.0.2 for Ruby 2.4.
 * At present, all versions of Ruby except 2.4 can use the OpenSSL packages
 * provided by the generic package install code.  But that may change...
 */
const openssl = async () => {
  let ssl = 'C:\\Windows\\System32\\'
  let badFiles = [`${ssl}libcrypto-1_1-x64.dll`, `${ssl}libssl-1_1-x64.dll`]
  badFiles.forEach( (bad) => {
    if (fs.existsSync(bad)) { fs.renameSync(bad, `${bad}_`) }
  })

  if (ruby.abiVers === '2.4.0') {
    let uri = 'https://github.com/MSP-Greg/ruby-loco/releases/download/old-ruby/mingw-w64-x86_64-openssl-1.0.2.u-1-any.pkg.tar.zst'
    let fn = `${dlPath}\\ri2.tar.zst`
    msSt = grpSt('install 2.4 OpenSSL')

    // appveyor ri2 package signing key
    // let key = 'F98B8484BE8BF1C5'
    // execSync(`bash.exe -c "pacman-key --recv-keys ${key}"`)
    // execSync(`bash.exe -c "pacman-key --lsign-key ${key}"`)
    // await download(`${uri}.sig`, `${fn}.sig`)

    await download(uri, fn)
    execSync(`pacman.exe -Udd --noconfirm --noprogressbar ${fn}`)
    grpEnd(msSt)
    mingw = mingw.replace(/\bopenssl\b/gi, '').trim()
  }
}

// Updates MSYS2 MinGW gcc items
const updateGCC = async () => {
  // TODO: code for installing gcc 9.2.0-1 or 9.1.0-3

  msSt = grpSt(`Upgrading gcc for Ruby ${ruby.vers}`)
  let gccPkgs = ['', 'binutils', 'crt', 'dlfcn', 'headers', 'libiconv', 'isl', 'make', 'mpc', 'mpfr', 'pkgconf', 'windows-default-manifest', 'libwinpthread', 'libyaml', 'winpthreads', 'zlib', 'gcc-libs', 'gcc']
  execSync(`pacman.exe ${msys2Sync} --nodeps ${args} ${gccPkgs.join(pre)}`)
  grpEnd(msSt)

  // await require('./mingw_gcc').run(ruby.vers)
}

// Used to install pre-built MSYS2 from a GitHub release asset, hopefully never
// needed once Actions Windows images have MSYS2 installed.
const installMSYS2 = async () => {
  const fn = `${dlPath}\\msys64.7z`
  const cmd = `7z x ${fn} -oC:\\`
  await download(`https://github.com/MSP-Greg/ruby-msys2-package-archive/releases/download/${RELEASE_ASSET}/msys64.7z`, fn)
  fs.rmdirSync('C:\\msys64', { recursive: true })
  execSyncQ(cmd)
  core.info('Installed MSYS2 for Ruby 2.4 and later')
}

// install MinGW packages from mingw input
const runMingw = async () => {

  if (ruby.abiVers >= '2.4') {
    // disable slow disk space check
    execSync("sed -i 's/^CheckSpace/#CheckSpace/g' C:/msys64/etc/pacman.conf")
    msSt = grpSt(`pacman.exe -Sy pacman-mirrors`)
    execSync(`pacman.exe -Sy ${args} pacman-mirrors`)
    grpEnd(msSt)
  }

  if (mingw.includes('_upgrade_')) {
    if (ruby.abiVers >= '2.4') {
      await updateGCC()
      msys2Sync = '-S'
    }
    mingw = mingw.replace(/\b_upgrade_\b/g, '').trim()
  }

  /* _msvc_ can be used when building mswin Rubies
   * when using an installed mingw Ruby, normally _upgrade_ should be used
   */
  if (mingw.includes('_msvc_')) {
    await __nccwpck_require__(956).addVCVARSEnv()
    return
  }

  if (mingw !== '') {
    if (ruby.abiVers >= '2.4.0') {
      if (mingw.includes('openssl')) {
        await openssl()
      }
      if (mingw !== '') {
        let pkgs = mingw.split(/\s+/)
        pkgs.unshift('')
        let list = pkgs.join(pre)
        if (msys2 !== '') {
          list += ' ' + msys2
          msys2 = ''
        }
        msSt = grpSt(`pacman.exe -S ${list}`)
        execSync(`pacman.exe ${msys2Sync} ${args} ${list}`)
        grpEnd(msSt)
      }
    } else {
      // install old DevKit packages
      let toInstall = []
      let pkgs = mingw.split(/\s+/)
      pkgs.forEach( (pkg) => {
        if (old_pkgs[pkg]) {
          toInstall.push({ pkg: pkg, uri: old_pkgs[pkg]})
        } else {
          core.warning(`Package '${pkg}' is not available`)
        }
      })
      if (toInstall.length !== 0) {
        const list = toInstall.map(item => item.pkg).join(' ')
        msSt = grpSt(`installing MSYS packages: ${list}`)
        for (const item of toInstall) {
          let fn = `${dlPath}\\${item.pkg}.tar.lzma`
          await download(item.uri, fn)
          let cmd = `7z x -tlzma ${fn} -so | 7z x -aoa -si -ttar -o${dirDK7z}`
          execSyncQ(cmd)
        }
        grpEnd(msSt)
      }
    }
  }
}

// install MSYS2 packages from mys2 input
const runMSYS2 = async () => {
  let pacman = 'pacman.exe'
  if (ruby.abiVers < '2.4.0') {
    pacman = 'C:\\msys64\\usr\\bin\\pacman.exe'
  }
  msSt = grpSt(`pacman.exe ${msys2Sync} ${msys2}`)
  execSync(`${pacman} ${msys2Sync} ${args} ${msys2}`)
  grpEnd(msSt)
}

const setRuby = (_ruby) => {
  ruby = _ruby
  pre = (ruby.platform === 'x64-mingw32') ? ' mingw-w64-x86_64-' : ' mingw-w64-i686-'
}

const run = async () => {
  try {
    // rename files that cause build conflicts with MSYS2
    // let badFiles = ['C:\\Strawberry\\c\\bin\\gmake.exe']
    // badFiles.forEach( (bad) => {
    //   if (fs.existsSync(bad)) { fs.renameSync(bad, `${bad}_`) }
    // })

    // await updateKeyRing('1~20210213-1')

    if (mingw !== '' || msys2 !== '') {
      if (ruby.abiVers >= '2.4.0') {
        // remove pacman CheckSpace, move cache dir to SSD
        const conf_fn = 'C:\\msys64\\etc\\pacman.conf'
        let conf      = fs.readFileSync(conf_fn, 'utf-8')
        let cache_dir = `${process.env.RUNNER_TEMP}\\pacman\\pkg`

        fs.mkdirSync(cache_dir, { recursive: true })

        cache_dir = win2nix(cache_dir)

        conf = conf.replace(/^CheckSpace/m, '#CheckSpace')
        conf = conf.replace(/^#CacheDir( += )[^\n]+/m, (m, p1) => {
          return `CacheDir ${p1}${cache_dir}`
        })
        fs.writeFileSync(conf_fn, conf, 'utf-8')

        /* setting to string uses specified release asset for MSYS2,
         * setting to null uses pre-installed MSYS2
         * release contains all Ruby building dependencies,
         * used when MSYS2 install or server have problems
         */
        RELEASE_ASSET = fs.lstatSync('C:\\msys64').isSymbolicLink() ?
          'msys2-2020-05-20' : null
        if (RELEASE_ASSET) {
          msSt = grpSt('Updating MSYS2')
          await installMSYS2()
          grpEnd(msSt)
        }

      } else {
        // get list of available pkgs for Ruby 2.2 & 2.3
        old_pkgs = __nccwpck_require__(709)/* .old_pkgs */ .c
      }

      // install user specificied packages
      if (mingw !== '') { await runMingw() }
      if (msys2 !== '') { await runMSYS2() }
    }

    if (ruby.abiVers >= '2.4.0') {
      // add home directory for user
      const dirHome = `C:\\msys64\\home\\${process.env.USERNAME}`
      if (!fs.existsSync(dirHome)) {
        fs.mkdirSync(dirHome, { recursive: true })
      }
    }

  } catch (error) {
    core.setFailed(error.message)
  }
}


/***/ }),

/***/ 956:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "setRuby": () => (/* binding */ setRuby),
/* harmony export */   "run": () => (/* binding */ run)
/* harmony export */ });


const fs   = __nccwpck_require__(747)
const core = __nccwpck_require__(948)

// , updateKeyRing
const { execSync, grpSt, grpEnd, getInput } = __nccwpck_require__(734)

// group start time
let msSt

let mingw = getInput('mingw')  // only parsed for openssl
let mswin = getInput('mswin')
let choco = getInput('choco')
let vcpkg = getInput('vcpkg')

let ruby

const setRuby = (_ruby) => { ruby = _ruby } // eslint-disable-line no-unused-vars

const run = async () => {
  try {
    if (mswin !== '') {
      // await updateKeyRing('1~20210213-1')

      if (mingw.includes('ragel') && !mswin.includes('ragel')) {
        mswin += ' mingw-w64-x86_64-ragel'
        mswin = mswin.trim()
      }
      msSt = grpSt(`install msys2 packages: ${mswin}`)
      execSync(`pacman.exe -Sy --noconfirm --noprogressbar --needed ${mswin}`)
      grpEnd(msSt)
    }

    if (mingw.includes('openssl')) {
      if (!choco.includes('openssl')) {
        choco += ' openssl'
        choco = choco.trim()
      }
    }

    if (choco !== '') {
      msSt = grpSt(`choco install ${choco}`)
      execSync(`choco install --no-progress ${choco}`)
      if (choco.includes('openssl')) {
        fs.renameSync('C:\\Program Files\\OpenSSL-Win64', 'C:\\openssl-win')
        core.exportVariable('SSL_DIR', '--with-openssl-dir=C:/openssl-win')
      }
      grpEnd(msSt)
    }

    if (vcpkg !== '') {
      msSt = grpSt(`vcpkg --triplet x64-windows install ${vcpkg}`)
      execSync(`vcpkg --triplet x64-windows install ${vcpkg}`)
      const vcpkgRoot = process.env.VCPKG_INSTALLATION_ROOT.replace(/\\/g, '/')
      core.exportVariable('OPT_DIR', `--with-opt-dir=${vcpkgRoot}/installed/x64-windows`)
      const vcpkgTools = `${process.env.VCPKG_INSTALLATION_ROOT}\\installed\\x64-windows\\tools`
      if (fs.existsSync(vcpkgTools) && fs.readdirSync(vcpkgTools).length >= 0) {
        core.addPath(vcpkgTools)
        console.log(`Added to Path: ${vcpkgTools}`)
      }
      grpEnd(msSt)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}


/***/ }),

/***/ 338:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(412);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 948:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(338);
const file_command_1 = __nccwpck_require__(550);
const utils_1 = __nccwpck_require__(412);
const os = __importStar(__nccwpck_require__(87));
const path = __importStar(__nccwpck_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    return inputs;
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function error(message, properties = {}) {
    command_1.issueCommand('error', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function warning(message, properties = {}) {
    command_1.issueCommand('warning', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function notice(message, properties = {}) {
    command_1.issueCommand('notice', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.notice = notice;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 550:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issueCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(747));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(412);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 412:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandProperties = exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
function toCommandProperties(annotationProperties) {
    if (!Object.keys(annotationProperties).length) {
        return {};
    }
    return {
        title: annotationProperties.title,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
    };
}
exports.toCommandProperties = toCommandProperties;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 666:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const http = __nccwpck_require__(605);
const https = __nccwpck_require__(211);
const pm = __nccwpck_require__(636);
let tunnel;
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    let proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'HttpClientError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
    }
}
exports.HttpClientError = HttpClientError;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return new Promise(async (resolve, reject) => {
            let output = Buffer.alloc(0);
            this.message.on('data', (chunk) => {
                output = Buffer.concat([output, chunk]);
            });
            this.message.on('end', () => {
                resolve(output.toString());
            });
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    let parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
            if (requestOptions.ignoreSslError != null) {
                this._ignoreSslError = requestOptions.ignoreSslError;
            }
            this._socketTimeout = requestOptions.socketTimeout;
            if (requestOptions.allowRedirects != null) {
                this._allowRedirects = requestOptions.allowRedirects;
            }
            if (requestOptions.allowRedirectDowngrade != null) {
                this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
            }
            if (requestOptions.maxRedirects != null) {
                this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
            }
            if (requestOptions.keepAlive != null) {
                this._keepAlive = requestOptions.keepAlive;
            }
            if (requestOptions.allowRetries != null) {
                this._allowRetries = requestOptions.allowRetries;
            }
            if (requestOptions.maxRetries != null) {
                this._maxRetries = requestOptions.maxRetries;
            }
        }
    }
    options(requestUrl, additionalHeaders) {
        return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
    }
    get(requestUrl, additionalHeaders) {
        return this.request('GET', requestUrl, null, additionalHeaders || {});
    }
    del(requestUrl, additionalHeaders) {
        return this.request('DELETE', requestUrl, null, additionalHeaders || {});
    }
    post(requestUrl, data, additionalHeaders) {
        return this.request('POST', requestUrl, data, additionalHeaders || {});
    }
    patch(requestUrl, data, additionalHeaders) {
        return this.request('PATCH', requestUrl, data, additionalHeaders || {});
    }
    put(requestUrl, data, additionalHeaders) {
        return this.request('PUT', requestUrl, data, additionalHeaders || {});
    }
    head(requestUrl, additionalHeaders) {
        return this.request('HEAD', requestUrl, null, additionalHeaders || {});
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return this.request(verb, requestUrl, stream, additionalHeaders);
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    async getJson(requestUrl, additionalHeaders = {}) {
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        let res = await this.get(requestUrl, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async postJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.post(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async putJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.put(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async patchJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.patch(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    async request(verb, requestUrl, data, headers) {
        if (this._disposed) {
            throw new Error('Client has already been disposed.');
        }
        let parsedUrl = new URL(requestUrl);
        let info = this._prepareRequest(verb, parsedUrl, headers);
        // Only perform retries on reads since writes may not be idempotent.
        let maxTries = this._allowRetries && RetryableHttpVerbs.indexOf(verb) != -1
            ? this._maxRetries + 1
            : 1;
        let numTries = 0;
        let response;
        while (numTries < maxTries) {
            response = await this.requestRaw(info, data);
            // Check if it's an authentication challenge
            if (response &&
                response.message &&
                response.message.statusCode === HttpCodes.Unauthorized) {
                let authenticationHandler;
                for (let i = 0; i < this.handlers.length; i++) {
                    if (this.handlers[i].canHandleAuthentication(response)) {
                        authenticationHandler = this.handlers[i];
                        break;
                    }
                }
                if (authenticationHandler) {
                    return authenticationHandler.handleAuthentication(this, info, data);
                }
                else {
                    // We have received an unauthorized response but have no handlers to handle it.
                    // Let the response return to the caller.
                    return response;
                }
            }
            let redirectsRemaining = this._maxRedirects;
            while (HttpRedirectCodes.indexOf(response.message.statusCode) != -1 &&
                this._allowRedirects &&
                redirectsRemaining > 0) {
                const redirectUrl = response.message.headers['location'];
                if (!redirectUrl) {
                    // if there's no location to redirect to, we won't
                    break;
                }
                let parsedRedirectUrl = new URL(redirectUrl);
                if (parsedUrl.protocol == 'https:' &&
                    parsedUrl.protocol != parsedRedirectUrl.protocol &&
                    !this._allowRedirectDowngrade) {
                    throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                }
                // we need to finish reading the response before reassigning response
                // which will leak the open socket.
                await response.readBody();
                // strip authorization header if redirected to a different hostname
                if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                    for (let header in headers) {
                        // header names are case insensitive
                        if (header.toLowerCase() === 'authorization') {
                            delete headers[header];
                        }
                    }
                }
                // let's make the request with the new redirectUrl
                info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                response = await this.requestRaw(info, data);
                redirectsRemaining--;
            }
            if (HttpResponseRetryCodes.indexOf(response.message.statusCode) == -1) {
                // If not a retry code, return immediately instead of retrying
                return response;
            }
            numTries += 1;
            if (numTries < maxTries) {
                await response.readBody();
                await this._performExponentialBackoff(numTries);
            }
        }
        return response;
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return new Promise((resolve, reject) => {
            let callbackForResult = function (err, res) {
                if (err) {
                    reject(err);
                }
                resolve(res);
            };
            this.requestRawWithCallback(info, data, callbackForResult);
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        let socket;
        if (typeof data === 'string') {
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        let handleResult = (err, res) => {
            if (!callbackCalled) {
                callbackCalled = true;
                onResult(err, res);
            }
        };
        let req = info.httpModule.request(info.options, (msg) => {
            let res = new HttpClientResponse(msg);
            handleResult(null, res);
        });
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error('Request timeout: ' + info.options.path), null);
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err, null);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        let parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
        if (this.handlers) {
            this.handlers.forEach(handler => {
                handler.prepareRequest(info.options);
            });
        }
        return info;
    }
    _mergeHeaders(headers) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers));
        }
        return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
            clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
        let agent;
        let proxyUrl = pm.getProxyUrl(parsedUrl);
        let useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
            agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
            agent = this._agent;
        }
        // if agent is already assigned use that agent.
        if (!!agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (!!this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (useProxy) {
            // If using proxy, need tunnel
            if (!tunnel) {
                tunnel = __nccwpck_require__(443);
            }
            const agentOptions = {
                maxSockets: maxSockets,
                keepAlive: this._keepAlive,
                proxy: {
                    ...((proxyUrl.username || proxyUrl.password) && {
                        proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
                    }),
                    host: proxyUrl.hostname,
                    port: proxyUrl.port
                }
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets: maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
            agent.options = Object.assign(agent.options || {}, {
                rejectUnauthorized: false
            });
        }
        return agent;
    }
    _performExponentialBackoff(retryNumber) {
        retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
        const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }
    static dateTimeDeserializer(key, value) {
        if (typeof value === 'string') {
            let a = new Date(value);
            if (!isNaN(a.valueOf())) {
                return a;
            }
        }
        return value;
    }
    async _processResponse(res, options) {
        return new Promise(async (resolve, reject) => {
            const statusCode = res.message.statusCode;
            const response = {
                statusCode: statusCode,
                result: null,
                headers: {}
            };
            // not found leads to null obj returned
            if (statusCode == HttpCodes.NotFound) {
                resolve(response);
            }
            let obj;
            let contents;
            // get the result from the body
            try {
                contents = await res.readBody();
                if (contents && contents.length > 0) {
                    if (options && options.deserializeDates) {
                        obj = JSON.parse(contents, HttpClient.dateTimeDeserializer);
                    }
                    else {
                        obj = JSON.parse(contents);
                    }
                    response.result = obj;
                }
                response.headers = res.message.headers;
            }
            catch (err) {
                // Invalid resource (contents not json);  leaving result obj null
            }
            // note that 3xx redirects are handled by the http layer.
            if (statusCode > 299) {
                let msg;
                // if exception/error in body, attempt to get better error
                if (obj && obj.message) {
                    msg = obj.message;
                }
                else if (contents && contents.length > 0) {
                    // it may be the case that the exception is in the body message as string
                    msg = contents;
                }
                else {
                    msg = 'Failed request: (' + statusCode + ')';
                }
                let err = new HttpClientError(msg, statusCode);
                err.result = response.result;
                reject(err);
            }
            else {
                resolve(response);
            }
        });
    }
}
exports.HttpClient = HttpClient;


/***/ }),

/***/ 636:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function getProxyUrl(reqUrl) {
    let usingSsl = reqUrl.protocol === 'https:';
    let proxyUrl;
    if (checkBypass(reqUrl)) {
        return proxyUrl;
    }
    let proxyVar;
    if (usingSsl) {
        proxyVar = process.env['https_proxy'] || process.env['HTTPS_PROXY'];
    }
    else {
        proxyVar = process.env['http_proxy'] || process.env['HTTP_PROXY'];
    }
    if (proxyVar) {
        proxyUrl = new URL(proxyVar);
    }
    return proxyUrl;
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    let noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    let upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (let upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperReqHosts.some(x => x === upperNoProxyItem)) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;


/***/ }),

/***/ 443:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(783);


/***/ }),

/***/ 783:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


var net = __nccwpck_require__(631);
var tls = __nccwpck_require__(16);
var http = __nccwpck_require__(605);
var https = __nccwpck_require__(211);
var events = __nccwpck_require__(614);
var assert = __nccwpck_require__(357);
var util = __nccwpck_require__(669);


exports.httpOverHttp = httpOverHttp;
exports.httpsOverHttp = httpsOverHttp;
exports.httpOverHttps = httpOverHttps;
exports.httpsOverHttps = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self = this;
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket)
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}


var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  }
} else {
  debug = function() {};
}
exports.debug = debug; // for test


/***/ }),

/***/ 709:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "c": () => (/* binding */ old_pkgs)
/* harmony export */ });


const baseUri = 'https://github.com/MSP-Greg/ruby-msys2-package-archive/releases/download/ri-msys-pkgs'

const baseSuf64 = 'x64-windows.tar.lzma'

const old_pkgs = {
  'gdbm'    : `${baseUri}/gdbm-1.8.3-${baseSuf64}`,
  'libffi'  : `${baseUri}/libffi-3.2.1-${baseSuf64}`,
  'libiconv': `${baseUri}/libiconv-1.14-${baseSuf64}`,
  'libiyaml': `${baseUri}/libyaml-0.1.7-${baseSuf64}`,
  'openssl' : `${baseUri}/openssl-1.0.2j-${baseSuf64}`,
  'ragel'   : `${baseUri}/ragel-6.7-${baseSuf64}`,
  'sqlite3' : `${baseUri}/sqlite-3.7.15.2-${baseSuf64}`,
  'zlib'    : `${baseUri}/zlib-1.2.8-${baseSuf64}`
}


/***/ }),

/***/ 357:
/***/ ((module) => {

"use strict";
module.exports = require("assert");;

/***/ }),

/***/ 129:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");;

/***/ }),

/***/ 614:
/***/ ((module) => {

"use strict";
module.exports = require("events");;

/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ 605:
/***/ ((module) => {

"use strict";
module.exports = require("http");;

/***/ }),

/***/ 211:
/***/ ((module) => {

"use strict";
module.exports = require("https");;

/***/ }),

/***/ 631:
/***/ ((module) => {

"use strict";
module.exports = require("net");;

/***/ }),

/***/ 87:
/***/ ((module) => {

"use strict";
module.exports = require("os");;

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),

/***/ 630:
/***/ ((module) => {

"use strict";
module.exports = require("perf_hooks");;

/***/ }),

/***/ 16:
/***/ ((module) => {

"use strict";
module.exports = require("tls");;

/***/ }),

/***/ 669:
/***/ ((module) => {

"use strict";
module.exports = require("util");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";


(async () => {
  const core = __nccwpck_require__(948)
  const { performance } = __nccwpck_require__(630)

  const common = __nccwpck_require__(734)

  const platform = __nccwpck_require__(87).platform()

  let ref = core.getInput('setup-ruby-ref')
  if (ref === '') { ref = 'ruby/setup-ruby/v1' }

  let rubyInfo
  let timeSt
  let doBundler = false

  const timeEnd = (msSt) => {
    const timeStr = ((performance.now() - msSt)/1000).toFixed(2).padStart(6)
    console.log(`  took ${timeStr} s`)
  }

  try {

    core.exportVariable('TMPDIR', process.env.RUNNER_TEMP)
    core.exportVariable('CI'    , 'true')

    const pkgs = async (ri) => {
      rubyInfo = ri
      timeEnd(timeSt)
      common.log(`  —————————————————— Package tasks using: MSP-Greg/setup-ruby-pkgs ${common.version}`)
      // console.log(rubyInfo)
      let runner
      let ruby

      switch (platform) {
        case 'linux':
          runner = __nccwpck_require__(110)  ; break
        case 'darwin':
          runner = __nccwpck_require__(310) ; break
        case 'win32':
          ruby = common.ruby()

          if      ( ruby.platform.includes('mingw') ) { runner = __nccwpck_require__(31) }
          else if ( ruby.platform.includes('mswin') ) { runner = __nccwpck_require__(956) }

          if (runner) { runner.setRuby(ruby) }  // pass Ruby info to runner
      }

      if (runner) { await runner.run() }

      if ((core.getInput('ruby-version') !== 'none') &&
          (core.getInput('bundler') !== 'none')    ) {
        doBundler = true
        timeSt = performance.now()
        common.log(`  —————————————————— Bundler tasks using: ${ref}`)
      }
    }

    timeSt = performance.now()

    if (core.getInput('ruby-version') !== 'none') {
      const fn = `${process.env.RUNNER_TEMP}\\setup_ruby.js`
      common.log(`  ——————————————————    Ruby tasks using: ${ref}`)
      await common.download(`https://raw.githubusercontent.com/${ref}/dist/index.js`, fn, false)
      // pass pkgs function to setup-ruby, allows package installation before
      // 'bundle install' but after ruby setup (install, paths, compile tools, etc)
      await require(fn).setupRuby({afterSetupPathHook: pkgs})
      if (doBundler) { timeEnd(timeSt) }
    } else {
      // install packages if setup-ruby is not used
      await pkgs()
    }
  } catch (e) {
    console.log(`::error::${e.message}`)
    process.exitCode = 1
  }
})()

})();

module.exports = __webpack_exports__;
/******/ })()
;