'use strict';
/** Requires */
import * as childProcess  from 'child_process';

import * as _             from 'lodash';


/** Init */
const { spawn } = childProcess;


export default class Git {
  constructor(options = {}) {
    this.options = _.merge({
      cwd: process.cwd()
    }, options);
  }

  log() {
    const commitsDivider = ` ___${('' + Math.random()).replace(/\./g, '')}___ `;
    const propsDivider = ` ___${('' + Math.random()).replace(/\./g, '')}___ `;

    const mapper = {
      commit:                 '%H',
      abbreviatedCommit:      '%h',
      tree:                   '%T',
      abbreviatedTree:        '%t',
      parent:                 '%P',
      abbreviatedParent:      '%p',
      refs:                   '%D',
      encoding:               '%e',
      subject:                '%s',
      sanitizedSubjectLine:   '%f',
      body:                   '%b',
      commitNotes:            '%N',
      verificationFlag:       '%G?',
      signer:                 '%GS',
      signerKey:              '%GK',
      authorName:             '%aN',
      authorEmail:            '%aE',
      authorDate:             '%aD',
      commiterName:           '%cN',
      commiterEmail:          '%cE',
      commiterDate:           '%cD'
    };

    let format = '';
    _.forEach(mapper, (val, key) => {
      format += ':::' + key + ':::' + val + propsDivider;
    });
    format += commitsDivider;

    return this._run('git', 'log', `--pretty=format:${format}`)
      .then((logs) => {
        const commits = logs.split(commitsDivider)
          .slice(0, -1)
          .map((commit) => commit.split(propsDivider).slice(0, -1))
          .map((props) => {
            return props.reduce((res, prop) => {
              const matches = prop.match(/:::([\w_]+):::/);

              const [, key] = matches;

              const val = prop.substring(matches.index + key.length + 6); // 6 === (':::' * 2)

              res[key] = val;

              return res;
            }, {});
          })
          .map((props) => ({
            commit:               props.commit,
            abbreviatedCommit:    props.abbreviatedCommit,
            tree:                 props.tree,
            abbreviatedTree:      props.abbreviatedTree,
            parent:               props.parent,
            abbreviatedParent:    props.abbreviatedParent,
            refs:                 props.refs,
            encoding:             props.encoding,
            subject:              props.subject,
            sanitizedSubjectLine: props.sanitizedSubjectLine,
            body:                 props.body,
            commitNotes:          props.commitNotes,
            verificationFlag:     props.verificationFlag,
            signer:               props.signer,
            signerKey:            props.signerKey,
            author: {
              name:               props.authorName,
              email:              props.authorEmail,
              date:               props.authorDate
            },
            commiter: {
              name:               props.commiterName,
              email:              props.commiterEmail,
              date:               props.commiterDate
            }
          }));

        return commits;
      });
  }

  _run(cmd, ...args) {
    return new Promise((resolve, reject) => {
      const sh = spawn(cmd, args, {
        cwd: this.options.cwd
      });

      let stdout = '';
      let stderr = '';

      sh.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      sh.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      sh.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(stderr);
        }
      });
    });
  }
}
